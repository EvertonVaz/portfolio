"""
HTTP server para controle e monitoramento dos treinos (GA e PPO).
Porta 4001 (proxied via Vite em dev como /train-api).

    GET  /status  → JSON: estado, históricos por algoritmo, frame da partida GA vs PPO
    POST /start   → inicia treino (body JSON: {"algo": "ga" | "ppo"}; default "ga")
    POST /stop    → para o treino em andamento (idempotente)

Cross-play: o GA avalia cada genoma também contra a rede PPO atual, e o PPO
inclui a rede GA no pool de oponentes do hall of fame.
"""
import copy
import json
import os
import threading
import time
from http.server import BaseHTTPRequestHandler
from socketserver import ThreadingMixIn, TCPServer

import numpy as np
import torch

from pong_ai.env import (
    ACTION_REPEAT, AI_X, BALL_ACCEL, BALL_R, H, MAX_BALL_SPEED, PADDLE_H,
    PADDLE_SPEED, PADDLE_W, PLAYER_X, W,
)
from pong_ai.net import QNetwork, RuleBasedNet, set_flat_params
from pong_ai.train_common import evaluate_in_env
from pong_ai.train_ga import (
    ELITE_FRAC, EPISODES_PER_EVAL, EVAL_WORKERS, GENERATIONS,
    MODEL_PATH as GA_MODEL_PATH, MUTATION_RATE, MUTATION_SCALE, N_ELITE,
    _build_net, _genome_size, _greedy_action, _initial_population, next_generation,
)
from pong_ai.train_ppo import MODEL_PATH as PPO_MODEL_PATH, TOTAL_STEPS

PORT           = int(os.getenv("TRAIN_SERVER_PORT", "4001"))
_GAME_FPS      = 60
_BALL_VX_INIT  = 4.0
_BALL_VY_INIT  = 3.0
_ANGLE_MULT    = 5.0
_OPPONENT_DEADBAND = 40.0   # px de deadband do rule-based (âncora do GA e fallback da arena)


# ── redes de inferência compartilhadas (preview) ─────────────────────────────
# Atualizadas pelas threads de treino, lidas pela thread do jogo.

_net_lock  = threading.Lock()
_ga_net    = QNetwork()
_ppo_net   = QNetwork()
_ga_ready  = False   # True após load de checkpoint ou primeiro update de treino
_ppo_ready = False

for _n in (_ga_net, _ppo_net):
    _n.eval()
    _n.requires_grad_(False)


def _update_ga_net(params: np.ndarray) -> None:
    global _ga_ready
    with _net_lock:
        set_flat_params(_ga_net, params)
        _ga_ready = True


def _update_ppo_net(state_dict: dict) -> None:
    global _ppo_ready
    with _net_lock:
        _ppo_net.load_state_dict(state_dict)
        _ppo_ready = True


def _net_action(net: QNetwork, obs: np.ndarray) -> int:
    with _net_lock:
        with torch.no_grad():
            return int(net(torch.FloatTensor(obs).unsqueeze(0)).argmax(dim=1).item())


def _flatten_net(net: QNetwork) -> np.ndarray:
    with _net_lock:
        return np.concatenate(
            [p.data.cpu().numpy().flatten() for p in net.parameters()]
        ).astype(np.float32)


# ── avaliação de fitness do GA (com cross-play) ──────────────────────────────

def _eval_ga_genome(
    args: tuple[np.ndarray, list[np.ndarray | None], list[int]]
) -> float:
    """Fitness = retorno médio por ponto vs cada oponente (None=rule-based, senão net).

    Roda nos workers do Pool. Reusa _build_net/_greedy_action do train_ga e o
    evaluate_in_env do train_common — mesma avaliação greedy do treino standalone.
    """
    genome, opp_params, seeds = args
    action_fn = _greedy_action(_build_net(genome))
    total = 0.0
    for p in opp_params:
        opp = RuleBasedNet(deadband=_OPPONENT_DEADBAND) if p is None else _build_net(p)
        total += evaluate_in_env(action_fn, opp, seeds)["return"]
    return total / len(opp_params)


# ── simulação de partida para visualização (thread separada) ─────────────────
# GA joga a raquete direita; PPO joga a esquerda com observação espelhada.
# Sem PPO carregado, a esquerda cai no rule-based com deadband.

_game_lock = threading.Lock()
_game = {
    "bx": W / 2.0, "by": H / 2.0,
    "bvx": _BALL_VX_INIT, "bvy": _BALL_VY_INIT,
    "ai_y": (H - PADDLE_H) / 2.0,
    "pl_y": (H - PADDLE_H) / 2.0,
    "ai_score": 0, "pl_score": 0,
    "tick": 0, "ai_action": 2, "pl_action": 2,
}


def _step_game() -> None:
    with _game_lock:
        g = _game

        # Redes decidem a cada ACTION_REPEAT ticks e a ação persiste
        # (mesma cadência do app e do treino)
        if g["tick"] % ACTION_REPEAT == 0:
            obs = np.array([
                g["bx"] / W * 2.0 - 1.0,
                g["by"] / H * 2.0 - 1.0,
                g["bvx"] / MAX_BALL_SPEED,
                g["bvy"] / MAX_BALL_SPEED,
                g["ai_y"] / (H - PADDLE_H) * 2.0 - 1.0,
                g["pl_y"] / (H - PADDLE_H) * 2.0 - 1.0,
            ], dtype=np.float32)
            g["ai_action"] = _net_action(_ga_net, obs)

            if _ppo_ready:
                obs_pl = np.array([
                    (W - g["bx"]) / W * 2.0 - 1.0,
                    g["by"] / H * 2.0 - 1.0,
                    -g["bvx"] / MAX_BALL_SPEED,
                    g["bvy"] / MAX_BALL_SPEED,
                    g["pl_y"] / (H - PADDLE_H) * 2.0 - 1.0,
                    g["ai_y"] / (H - PADDLE_H) * 2.0 - 1.0,
                ], dtype=np.float32)
                g["pl_action"] = _net_action(_ppo_net, obs_pl)
        g["tick"] += 1

        if g["ai_action"] == 0:
            g["ai_y"] = max(0.0, g["ai_y"] - PADDLE_SPEED)
        elif g["ai_action"] == 1:
            g["ai_y"] = min(H - PADDLE_H, g["ai_y"] + PADDLE_SPEED)

        if _ppo_ready:
            if g["pl_action"] == 0:
                g["pl_y"] = max(0.0, g["pl_y"] - PADDLE_SPEED)
            elif g["pl_action"] == 1:
                g["pl_y"] = min(H - PADDLE_H, g["pl_y"] + PADDLE_SPEED)
        else:
            # Fallback: rule-based com handicap de threshold
            target = g["by"] - PADDLE_H / 2.0
            diff   = g["pl_y"] - target
            if diff > _OPPONENT_DEADBAND:
                g["pl_y"] = max(0.0, g["pl_y"] - PADDLE_SPEED)
            elif diff < -_OPPONENT_DEADBAND:
                g["pl_y"] = min(H - PADDLE_H, g["pl_y"] + PADDLE_SPEED)

        g["bx"] += g["bvx"]
        g["by"] += g["bvy"]

        if g["by"] - BALL_R <= 0:
            g["by"] = float(BALL_R); g["bvy"] = abs(g["bvy"])
        elif g["by"] + BALL_R >= H:
            g["by"] = float(H - BALL_R); g["bvy"] = -abs(g["bvy"])

        # Colisão esquerda (PPO)
        if (g["bvx"] < 0 and g["bx"] - BALL_R <= PLAYER_X + PADDLE_W
                and g["pl_y"] <= g["by"] <= g["pl_y"] + PADDLE_H):
            rel = (g["by"] - (g["pl_y"] + PADDLE_H / 2.0)) / (PADDLE_H / 2.0)
            g["bx"] = float(PLAYER_X + PADDLE_W + BALL_R)
            g["bvx"] = min(abs(g["bvx"]) * BALL_ACCEL, MAX_BALL_SPEED)
            g["bvy"] = rel * _ANGLE_MULT

        # Colisão direita (GA)
        if (g["bvx"] > 0 and g["bx"] + BALL_R >= AI_X
                and g["ai_y"] <= g["by"] <= g["ai_y"] + PADDLE_H):
            rel = (g["by"] - (g["ai_y"] + PADDLE_H / 2.0)) / (PADDLE_H / 2.0)
            g["bx"] = float(AI_X - BALL_R)
            g["bvx"] = -min(abs(g["bvx"]) * BALL_ACCEL, MAX_BALL_SPEED)
            g["bvy"] = rel * _ANGLE_MULT

        if g["bx"] < 0:
            g["ai_score"] += 1
            g["bx"], g["by"] = W / 2.0, H / 2.0
            g["bvx"], g["bvy"] = _BALL_VX_INIT, float(np.random.choice([-_BALL_VY_INIT, _BALL_VY_INIT]))
        elif g["bx"] > W:
            g["pl_score"] += 1
            g["bx"], g["by"] = W / 2.0, H / 2.0
            g["bvx"], g["bvy"] = -_BALL_VX_INIT, float(np.random.choice([-_BALL_VY_INIT, _BALL_VY_INIT]))


def _game_snapshot() -> dict:
    with _game_lock:
        g = _game
        return {
            "ball":   {"x": g["bx"],    "y": g["by"]},
            "ai":     {"y": g["ai_y"],  "score": g["ai_score"]},
            "player": {"y": g["pl_y"],  "score": g["pl_score"]},
        }


def _game_loop() -> None:
    while True:
        _step_game()
        time.sleep(1 / _GAME_FPS)


# ── estado do treino ──────────────────────────────────────────────────────────

_train_lock  = threading.Lock()
_train_state = {
    "running":    False,
    "algo":       "ga",       # algoritmo em treino (ou o último)
    "generation": 0,          # gerações (ga) ou global steps (ppo)
    "total":      GENERATIONS,
    "histories":  {"ga": [], "ppo": []},   # [{gen, mean, std, best}]
}

_stop_event   = threading.Event()
_train_thread = None


def _finish_training() -> None:
    """Zera a flag running — só se esta thread ainda for a de treino ativa.

    Uma thread antiga pode terminar seu último rollout/geração depois de um
    novo treino já ter começado; sem a guarda, ela derrubaria a flag do novo.
    """
    with _train_lock:
        if _train_thread is threading.current_thread():
            _train_state["running"] = False


def _run_training_ga() -> None:
    from multiprocessing import Pool

    rng = np.random.default_rng()
    size = _genome_size()
    # Retoma de ga.pt (campeão + mutações) se existir, senão população aleatória
    pop, start_gen = _initial_population(rng, size)
    _update_ga_net(pop[0])  # mostra algo na arena de imediato

    target = start_gen + GENERATIONS
    with _train_lock:
        _train_state["total"] = target

    try:
        with Pool(processes=EVAL_WORKERS) as pool:
            for gen in range(start_gen, target):
                if _stop_event.is_set():
                    break

                opp_params: list[np.ndarray | None] = [None]  # âncora rule-based
                if _ppo_ready:
                    opp_params.append(_flatten_net(_ppo_net))  # cross-play vs PPO

                # Common random numbers: mesmas seeds para todos os genomas da geração
                seeds = [int(rng.integers(0, 2**31 - 1)) for _ in range(EPISODES_PER_EVAL)]
                fitness = pool.map(_eval_ga_genome, [(g, opp_params, seeds) for g in pop])

                champ = pop[int(np.argmax(fitness))]
                _update_ga_net(champ)

                record = {
                    "gen":  gen,
                    "mean": float(np.mean(fitness)),
                    "std":  float(np.std(fitness)),
                    "best": float(np.max(fitness)),
                }
                with _train_lock:
                    _train_state["generation"] = gen
                    _train_state["histories"]["ga"].append(record)

                torch.save({"params": torch.from_numpy(champ), "generation": gen}, GA_MODEL_PATH)

                pop = next_generation(
                    pop, fitness, rng, ELITE_FRAC, N_ELITE, MUTATION_RATE, MUTATION_SCALE
                )
    finally:
        _finish_training()


def _run_training_ppo() -> None:
    from pong_ai import train_ppo

    extra_opponents = []
    if _ga_ready:
        with _net_lock:
            extra_opponents.append(copy.deepcopy(_ga_net.state_dict()))  # cross-play vs GA

    def on_rollout(agent, target, completed):
        _update_ppo_net(agent.policy.state_dict())
        recent = completed[-50:] if completed else [0.0]
        record = {
            "gen":  agent.global_step,
            "mean": float(np.mean(recent)),
            "std":  float(np.std(recent)),
            "best": float(np.max(recent)),
        }
        with _train_lock:
            _train_state["total"] = target
            _train_state["generation"] = agent.global_step
            _train_state["histories"]["ppo"].append(record)

    try:
        train_ppo.train(
            resume=True,
            stop_event=_stop_event,
            on_rollout=on_rollout,
            extra_opponents=extra_opponents,
        )
    finally:
        _finish_training()


def _start_training(algo: str) -> None:
    global _train_thread
    with _train_lock:
        if _train_state["running"]:
            return
        _train_state["running"] = True
        _train_state["algo"] = algo
        _train_state["generation"] = 0
        _train_state["total"] = TOTAL_STEPS if algo == "ppo" else GENERATIONS
    _stop_event.clear()
    run = _run_training_ppo if algo == "ppo" else _run_training_ga
    _train_thread = threading.Thread(target=run, daemon=True)
    _train_thread.start()


def _stop_training() -> None:
    _stop_event.set()
    with _train_lock:
        _train_state["running"] = False


# ── HTTP handler ──────────────────────────────────────────────────────────────

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *_args):
        pass  # silencia logs de acesso no stdout

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin",  "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if self.path != "/status":
            self.send_response(404); self.end_headers(); return

        with _train_lock:
            payload = {
                "running":    _train_state["running"],
                "algo":       _train_state["algo"],
                "generation": _train_state["generation"],
                "total":      _train_state["total"],
                "histories": {
                    "ga":  _train_state["histories"]["ga"][-300:],
                    "ppo": _train_state["histories"]["ppo"][-300:],
                },
                "game":       _game_snapshot(),
            }

        body = json.dumps(payload).encode()
        self.send_response(200)
        self.send_header("Content-Type",   "application/json")
        self.send_header("Content-Length", str(len(body)))
        self._cors()
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path == "/start":
            length = int(self.headers.get("Content-Length") or 0)
            try:
                params = json.loads(self.rfile.read(length)) if length else {}
            except json.JSONDecodeError:
                params = {}
            algo = "ppo" if params.get("algo") == "ppo" else "ga"
            _start_training(algo)
        elif self.path == "/stop":
            _stop_training()
        else:
            self.send_response(404); self.end_headers(); return

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self._cors()
        self.end_headers()
        self.wfile.write(b'{"ok":true}')


class _ThreadedHTTPServer(ThreadingMixIn, TCPServer):
    allow_reuse_address = True
    daemon_threads      = True


if __name__ == "__main__":
    if GA_MODEL_PATH.exists():
        _data = torch.load(GA_MODEL_PATH, map_location="cpu", weights_only=True)
        _update_ga_net(_data["params"].numpy().astype(np.float32))

    if PPO_MODEL_PATH.exists():
        from pong_ai.ppo import PPOAgent
        tmp_ppo = PPOAgent()
        tmp_ppo.load(str(PPO_MODEL_PATH))
        _update_ppo_net(tmp_ppo.policy.state_dict())

    threading.Thread(target=_game_loop, daemon=True).start()

    print(f"[train_server] port {PORT} | proxy via /train-api")
    _ThreadedHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
