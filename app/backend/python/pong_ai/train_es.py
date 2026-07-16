"""
Treinamento via Evolution Strategies (OpenAI ES).

Uso:
    python -m pong_ai.train_es           # treina ou retoma do checkpoint es.pt
    python -m pong_ai.train_es --fresh   # ignora checkpoint existente
"""
import logging
import sys
from multiprocessing import Pool, cpu_count
from pathlib import Path

import numpy as np
import torch

from pong_ai.env import (
    ACTION_REPEAT, AI_X, BALL_ACCEL, BALL_R, H, MAX_BALL_SPEED, PADDLE_H,
    PADDLE_SPEED, PADDLE_W, PLAYER_X, W,
)
from pong_ai.es import ESAgent, QNetwork

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

MODELS_DIR = Path(__file__).parent / "models"
MODEL_PATH = MODELS_DIR / "es.pt"

POP_SIZE            = 50
SIGMA_START         = 0.10   # explora mais no início
SIGMA_END           = 0.02   # refina no final
LR                  = 0.07
GENERATIONS         = 300
GAMES_PER_EVAL      = 10     # mais pontos por partida → fitness menos ruidoso
EVAL_WORKERS        = min(POP_SIZE, cpu_count())
OPPONENT_THRESHOLD  = 40.0   # px de deadband do oponente rule-based (maior = mais lento)
MAX_STEPS_PER_MATCH = 8_000  # teto de steps por partida — evita loop infinito em stalemates

# Hall of fame: arquivo de snapshots do próprio agente usados como oponentes.
# None no arquivo representa o oponente rule-based (âncora inicial).
HOF_SNAPSHOT_EVERY  = 20     # gerações entre snapshots
HOF_MAX_SIZE        = 10     # cap do arquivo (descarta o mais antigo, preservando a âncora)

# Pesos da função de fitness
_SCORE_WEIGHT       = 1.0
_ANGLE_WEIGHT       = 0.06   # bônus por rebatida: proporcional a |relative| (0=centro, 1=borda)
_STALEMATE_PENALTY  = 0.3    # desconto por ponto não jogado quando o tempo esgota


# ── simulação manual (sem PongEnv) ────────────────────────────────────────────
# Evita o env para (a) distinguir gol de rebatida na borda sem ambiguidade de
# reward e (b) usar oponente rule-based com leve handicap de threshold.

def _simulate_match(
    net: QNetwork, opponent: QNetwork | None = None
) -> tuple[float, float, float, bool]:
    """
    Joga até GAMES_PER_EVAL pontos (ou MAX_STEPS_PER_MATCH steps).

    opponent=None usa o rule-based com deadband; caso contrário, a rede
    oponente joga o lado esquerdo com observação espelhada (eixo X invertido).

    As redes decidem a cada ACTION_REPEAT ticks e a ação persiste entre
    decisões (cadência de produção). O rule-based continua decidindo por tick.

    Retorna (ai_score, player_score, angle_sum, truncated).
    angle_sum: soma de |relative| em cada rebatida da IA — premia bordas, penaliza centro.
    truncated: True se o limite de steps foi atingido antes de completar a partida.
    """
    bx, by   = W / 2.0, H / 2.0
    bvx, bvy = 4.0, 3.0
    ai_y     = (H - PADDLE_H) / 2.0
    pl_y     = (H - PADDLE_H) / 2.0

    ai_score = pl_score = 0
    angle_sum = 0.0
    steps = 0
    action = action_opp = 2  # parado até a primeira decisão

    while ai_score + pl_score < GAMES_PER_EVAL:
        if steps >= MAX_STEPS_PER_MATCH:
            return float(ai_score), float(pl_score), angle_sum, True

        if steps % ACTION_REPEAT == 0:
            obs = np.array([
                bx / W * 2.0 - 1.0,
                by / H * 2.0 - 1.0,
                bvx / MAX_BALL_SPEED,
                bvy / MAX_BALL_SPEED,
                ai_y / (H - PADDLE_H) * 2.0 - 1.0,
                pl_y / (H - PADDLE_H) * 2.0 - 1.0,
            ], dtype=np.float32)

            with torch.no_grad():
                action = int(net(torch.FloatTensor(obs).unsqueeze(0)).argmax(dim=1).item())

            if opponent is not None:
                # Snapshot do hall of fame — observação espelhada (lado esquerdo)
                obs_opp = np.array([
                    (W - bx) / W * 2.0 - 1.0,
                    by / H * 2.0 - 1.0,
                    -bvx / MAX_BALL_SPEED,
                    bvy / MAX_BALL_SPEED,
                    pl_y / (H - PADDLE_H) * 2.0 - 1.0,
                    ai_y / (H - PADDLE_H) * 2.0 - 1.0,
                ], dtype=np.float32)
                with torch.no_grad():
                    action_opp = int(opponent(torch.FloatTensor(obs_opp).unsqueeze(0)).argmax(dim=1).item())

        steps += 1

        if action == 0:
            ai_y = max(0.0, ai_y - PADDLE_SPEED)
        elif action == 1:
            ai_y = min(H - PADDLE_H, ai_y + PADDLE_SPEED)

        if opponent is None:
            # Rule-based com deadband — decide por tick (âncora inalterada)
            target = by - PADDLE_H / 2.0
            diff   = pl_y - target
            if diff > OPPONENT_THRESHOLD:
                pl_y = max(0.0, pl_y - PADDLE_SPEED)
            elif diff < -OPPONENT_THRESHOLD:
                pl_y = min(H - PADDLE_H, pl_y + PADDLE_SPEED)
        elif action_opp == 0:
            pl_y = max(0.0, pl_y - PADDLE_SPEED)
        elif action_opp == 1:
            pl_y = min(H - PADDLE_H, pl_y + PADDLE_SPEED)

        bx += bvx
        by += bvy
        if by - BALL_R <= 0:
            by  = float(BALL_R)
            bvy = abs(bvy)
        elif by + BALL_R >= H:
            by  = float(H - BALL_R)
            bvy = -abs(bvy)

        if (bvx < 0
                and bx - BALL_R <= PLAYER_X + PADDLE_W
                and pl_y <= by <= pl_y + PADDLE_H):
            relative = (by - (pl_y + PADDLE_H / 2.0)) / (PADDLE_H / 2.0)
            bx  = float(PLAYER_X + PADDLE_W + BALL_R)
            bvx = min(abs(bvx) * BALL_ACCEL, MAX_BALL_SPEED)
            bvy = relative * 5.0

        if (bvx > 0
                and bx + BALL_R >= AI_X
                and ai_y <= by <= ai_y + PADDLE_H):
            relative = (by - (ai_y + PADDLE_H / 2.0)) / (PADDLE_H / 2.0)
            bx  = float(AI_X - BALL_R)
            bvx = -min(abs(bvx) * BALL_ACCEL, MAX_BALL_SPEED)
            bvy = relative * 5.0
            angle_sum += abs(relative)  # 0=centro, 1=borda

        if bx < 0:
            ai_score += 1
            bx, by   = W / 2.0, H / 2.0
            bvx, bvy = 4.0, 3.0
        elif bx > W:
            pl_score += 1
            bx, by   = W / 2.0, H / 2.0
            bvx, bvy = -4.0, 3.0

    return float(ai_score), float(pl_score), angle_sum, False


# ── worker ────────────────────────────────────────────────────────────────────

def _set_params_to_net(net: QNetwork, params: np.ndarray) -> None:
    idx = 0
    with torch.no_grad():
        for p in net.parameters():
            size = p.numel()
            p.data.copy_(
                torch.from_numpy(
                    params[idx: idx + size].reshape(p.shape).astype(np.float32)
                )
            )
            idx += size


def _build_net(params: np.ndarray) -> QNetwork:
    net = QNetwork()
    _set_params_to_net(net, params)
    net.eval()
    net.requires_grad_(False)
    return net


def evaluate_individual(args: tuple[np.ndarray, list[np.ndarray | None]]) -> float:
    """
    Fitness médio contra os oponentes do hall of fame.

    Cada partida: score_diff + angle_bonus - stalemate_penalty.
    angle_bonus: soma de |relative| das rebatidas da IA — bordas valem mais que centro.
    stalemate_penalty: desconto proporcional a pontos não jogados quando o tempo esgota,
                       punindo diretamente o comportamento de rali infinito.
    """
    params, opponents_params = args
    net = _build_net(params)

    total = 0.0
    for opp_params in opponents_params:
        opponent = _build_net(opp_params) if opp_params is not None else None
        ai_score, pl_score, angle_sum, truncated = _simulate_match(net, opponent)

        score_diff        = _SCORE_WEIGHT * (ai_score - pl_score)
        angle_bonus       = _ANGLE_WEIGHT * angle_sum
        stalemate_penalty = _STALEMATE_PENALTY * (GAMES_PER_EVAL - ai_score - pl_score) if truncated else 0.0
        total += score_diff + angle_bonus - stalemate_penalty

    return total / len(opponents_params)


def _sample_opponents(hof: list[np.ndarray | None]) -> list[np.ndarray | None]:
    """Snapshot mais recente + um mais antigo aleatório (curriculum de dificuldade)."""
    if len(hof) == 1:
        return [hof[0]]
    older = hof[np.random.randint(0, len(hof) - 1)]
    return [hof[-1], older]


def _eval_current(
    pool: Pool,
    params: np.ndarray,
    opponents: list[np.ndarray | None],
    n: int = 10,
) -> float:
    results = pool.map(evaluate_individual, [(params, opponents)] * n)
    return float(np.mean(results))


# ── loop principal ────────────────────────────────────────────────────────────

def train(resume: bool = True) -> None:
    MODELS_DIR.mkdir(exist_ok=True)

    agent = ESAgent(pop_size=POP_SIZE, sigma=SIGMA_START, lr=LR)

    if resume and MODEL_PATH.exists():
        agent.load(str(MODEL_PATH))
    else:
        logger.info("Starting ES training from scratch (random init)")

    # Se o checkpoint já completou a meta, roda mais GENERATIONS a partir dele
    target = GENERATIONS if agent.generation < GENERATIONS else agent.generation + GENERATIONS

    # Hall of fame: âncora rule-based + snapshot do agente atual (se retomando)
    hof: list[np.ndarray | None] = [None]
    if agent.generation > 0:
        hof.append(agent.params.copy())

    logger.info(
        "ES training | pop=%d | sigma %.3f→%.3f | lr=%.3f | gen %d→%d | workers=%d | hof=%d",
        POP_SIZE, SIGMA_START, SIGMA_END, LR, agent.generation, target, EVAL_WORKERS, len(hof),
    )

    with Pool(processes=EVAL_WORKERS) as pool:
        for gen in range(agent.generation, target):
            # Sigma decay linear: explora no início, refina no fim
            progress = (gen - agent.generation) / max(target - agent.generation, 1)
            agent.sigma = SIGMA_START + (SIGMA_END - SIGMA_START) * progress

            opponents = _sample_opponents(hof)
            candidates, epsilons = agent.ask()
            fitness = pool.map(evaluate_individual, [(c, opponents) for c in candidates])
            agent.tell(fitness, epsilons)

            if (gen + 1) % HOF_SNAPSHOT_EVERY == 0:
                hof.append(agent.params.copy())
                if len(hof) > HOF_MAX_SIZE:
                    del hof[1]  # descarta o snapshot mais antigo, preserva a âncora rule-based
                logger.info("HOF snapshot at gen %d (archive size %d)", gen, len(hof))

            if gen % 10 == 0:
                best = _eval_current(pool, agent.params, opponents)
                logger.info(
                    "gen %d/%d | sigma=%.3f | best=%.2f | pop_mean=%.2f | pop_std=%.2f | hof=%d",
                    gen, target, agent.sigma, best,
                    float(np.mean(fitness)), float(np.std(fitness)), len(hof),
                )

            agent.save(str(MODEL_PATH))

    logger.info("Training complete → %s (generation %d)", MODEL_PATH, agent.generation)


if __name__ == "__main__":
    resume = "--fresh" not in sys.argv
    train(resume=resume)
