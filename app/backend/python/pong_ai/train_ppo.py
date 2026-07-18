"""
Treinamento via PPO com self-play (hall of fame de snapshots da política).

Uso:
    python -m pong_ai.train_ppo           # treina ou retoma do checkpoint ppo.pt
    python -m pong_ai.train_ppo --fresh   # ignora checkpoint existente
"""
import copy
import logging
import random
import sys
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
from gymnasium.vector import AutoresetMode, SyncVectorEnv

from pong_ai.env import PongEnv
from pong_ai.es import QNetwork, RuleBasedNet
from pong_ai.ppo import PPOAgent
from pong_ai.train_common import ANCHOR_DEADBAND, EVAL_SEEDS, evaluate_in_env, format_log

# Rede minúscula (6→16→16→3): mais threads só adiciona overhead de sincronização.
torch.set_num_threads(1)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

MODELS_DIR = Path(__file__).parent / "models"
MODEL_PATH = MODELS_DIR / "ppo.pt"

NUM_ENVS      = 8
ROLLOUT_STEPS = 256          # steps por env antes de cada update → batch de 2048
TOTAL_STEPS   = 2_000_000
LOG_EVERY     = 10           # rollouts entre logs
SAVE_EVERY    = 10           # rollouts entre checkpoints (evita I/O a cada rollout)
ENTROPY_COEF  = 0.025        # exploração: self-play puro colapsa a política com 0.01

# Hall of fame: snapshots da política usados como oponente (self-play).
# None = âncora rule-based fixa — oponente competente que dá pressão real de
# aprendizado (sem ela o self-play empata consigo mesmo e estaciona em ~50%).
HOF_SNAPSHOT_EVERY = 50_000  # steps globais entre snapshots
HOF_MAX_SIZE       = 10


class SwappableOpponent(nn.Module):
    """Oponente compartilhado pelos envs cujo alvo pode ser trocado in-place.

    Os envs capturam esta referência na criação; trocar o alvo aqui muda o
    oponente de todos os envs de uma vez, sem recriar o SyncVectorEnv.
    """

    def __init__(self, net: nn.Module):
        super().__init__()
        self._net = net

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self._net(x)

    def set(self, net: nn.Module) -> None:
        self._net = net


def _explained_variance(y_pred: np.ndarray, y_true: np.ndarray) -> float:
    """Quão bem V(s) explica os retornos: 1.0 = perfeito, 0 = inútil, <0 = pior que a média."""
    var_y = np.var(y_true)
    return float("nan") if var_y == 0 else float(1.0 - np.var(y_true - y_pred) / var_y)


def train(
    resume: bool = True,
    stop_event=None,
    on_rollout=None,
    extra_opponents: list[dict] | None = None,
) -> None:
    """
    stop_event:      threading.Event opcional — encerra o loop quando setado.
    on_rollout:      callback(agent, target, completed_returns) após cada rollout.
    extra_opponents: state_dicts extras para o pool de oponentes (ex: rede ES).
    """
    MODELS_DIR.mkdir(exist_ok=True)

    agent = PPOAgent(entropy_coef=ENTROPY_COEF)
    if resume and MODEL_PATH.exists():
        agent.load(str(MODEL_PATH))
    else:
        logger.info("Starting PPO training from scratch")

    # Âncora rule-based fixa: oponente competente (com handicap) no lado esquerdo.
    rule_net = RuleBasedNet(deadband=ANCHOR_DEADBAND)
    rule_net.eval()
    rule_net.requires_grad_(False)
    # Rede de trabalho reutilizada para carregar snapshots do HOF.
    opp_net = QNetwork()
    opp_net.eval()
    opp_net.requires_grad_(False)

    # Oponente compartilhado pelos envs; começa contra a âncora rule-based.
    opponent = SwappableOpponent(rule_net)

    # hof: None = âncora rule-based; dict = snapshot da política (self-play).
    hof: list[dict | None] = [None, copy.deepcopy(agent.policy.state_dict())]
    hof.extend(copy.deepcopy(sd) for sd in (extra_opponents or []))

    def _swap_opponent(choice: dict | None) -> None:
        if choice is None:
            opponent.set(rule_net)
        else:
            opp_net.load_state_dict(choice)
            opponent.set(opp_net)

    next_snapshot = agent.global_step + HOF_SNAPSHOT_EVERY

    # Se o checkpoint já completou a meta, roda mais TOTAL_STEPS a partir dele
    target = TOTAL_STEPS if agent.global_step < TOTAL_STEPS else agent.global_step + TOTAL_STEPS

    envs = SyncVectorEnv(
        [lambda: PongEnv(opponent=opponent) for _ in range(NUM_ENVS)],
        autoreset_mode=AutoresetMode.SAME_STEP,
    )
    obs, _ = envs.reset(seed=42)

    logger.info(
        "PPO training | %d envs | rollout=%d | global_step %d→%d | hof a cada %d steps",
        NUM_ENVS, ROLLOUT_STEPS, agent.global_step, target, HOF_SNAPSHOT_EVERY,
    )

    # Acumuladores por env (zerados ao fim de cada episódio/ponto)
    ep_ret = np.zeros(NUM_ENVS, dtype=np.float32)
    ep_len = np.zeros(NUM_ENVS, dtype=np.int64)
    # Episódios completos desde o último log (return, duração, rebatidas, venceu?)
    c_ret:  list[float] = []
    c_len:  list[int]   = []
    c_hits: list[int]   = []
    c_win:  list[int]   = []
    rollout_count = 0

    while agent.global_step < target and not (stop_event is not None and stop_event.is_set()):
        # ── coleta de rollout ────────────────────────────────────────────────
        b_obs      = np.zeros((ROLLOUT_STEPS, NUM_ENVS, 6), dtype=np.float32)
        b_actions  = np.zeros((ROLLOUT_STEPS, NUM_ENVS), dtype=np.int64)
        b_logprobs = np.zeros((ROLLOUT_STEPS, NUM_ENVS), dtype=np.float32)
        b_values   = np.zeros((ROLLOUT_STEPS, NUM_ENVS), dtype=np.float32)
        b_rewards  = np.zeros((ROLLOUT_STEPS, NUM_ENVS), dtype=np.float32)
        b_dones    = np.zeros((ROLLOUT_STEPS, NUM_ENVS), dtype=np.float32)

        for t in range(ROLLOUT_STEPS):
            actions, logprobs, values = agent.act(obs)
            next_obs, rewards, terminated, truncated, info = envs.step(actions)
            dones = terminated | truncated

            b_obs[t], b_actions[t], b_logprobs[t] = obs, actions, logprobs
            b_values[t], b_rewards[t], b_dones[t] = values, rewards, dones.astype(np.float32)

            ep_ret += rewards.astype(np.float32)
            ep_len += 1
            done_idx = np.flatnonzero(dones)
            if done_idx.size:
                # No modo SAME_STEP as métricas do env terminal ficam em final_info
                final = info.get("final_info", {})
                fin_hits, fin_res = final.get("hits"), final.get("result")
                for k in done_idx:
                    c_ret.append(float(ep_ret[k]))
                    c_len.append(int(ep_len[k]))
                    c_hits.append(int(fin_hits[k]) if fin_hits is not None else 0)
                    c_win.append(1 if (fin_res is not None and fin_res[k] > 0) else 0)
                    ep_ret[k] = 0.0
                    ep_len[k] = 0

            obs = next_obs
            agent.global_step += NUM_ENVS

        # ── GAE + update ─────────────────────────────────────────────────────
        last_values = agent.estimate_values(obs)
        advantages, returns = agent.compute_gae(b_rewards, b_values, b_dones, last_values)

        stats = agent.update(
            b_obs.reshape(-1, 6),
            b_actions.reshape(-1),
            b_logprobs.reshape(-1),
            advantages.reshape(-1),
            returns.reshape(-1),
        )

        # ── hall of fame: congela snapshot e troca o oponente ────────────────
        if agent.global_step >= next_snapshot:
            hof.append(copy.deepcopy(agent.policy.state_dict()))
            if len(hof) > HOF_MAX_SIZE:
                hof.pop(1)  # descarta o snapshot mais antigo, preserva a âncora rule-based (hof[0])
            choice = random.choice(hof)
            _swap_opponent(choice)
            next_snapshot += HOF_SNAPSHOT_EVERY
            logger.info(
                "HOF snapshot at step %d (archive %d) — opponent=%s",
                agent.global_step, len(hof), "rule-based" if choice is None else "self",
            )

        rollout_count += 1
        if rollout_count % SAVE_EVERY == 0:
            agent.save(str(MODEL_PATH))

        if on_rollout is not None:
            on_rollout(agent, target, c_ret)

        if rollout_count % LOG_EVERY == 0:
            ev = _explained_variance(b_values.reshape(-1), returns.reshape(-1))
            # Métricas de comportamento vs âncora rule-based (mesmo eval do ES)
            m = evaluate_in_env(agent.predict, RuleBasedNet(deadband=ANCHOR_DEADBAND), EVAL_SEEDS)
            train_ret = float(np.mean(c_ret[-200:])) if c_ret else 0.0  # retorno self-play
            extra = (
                f" | train_ret={train_ret:.2f} | ent={stats['entropy']:.3f} | "
                f"v_ev={ev:.2f} | v_loss={stats['value_loss']:.3f}"
            )
            logger.info(format_log("step", agent.global_step, target, m, extra))

    envs.close()
    agent.save(str(MODEL_PATH))
    logger.info("Training complete → %s (global_step %d)", MODEL_PATH, agent.global_step)


if __name__ == "__main__":
    train(resume="--fresh" not in sys.argv)
