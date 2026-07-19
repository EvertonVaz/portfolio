"""Testes da física do PongEnv, sem pytest no projeto.

Roda com:  uv run python -m pong_ai.test_env

O teste central é de CARACTERIZAÇÃO: valores golden capturados do PongEnv ANTES
de extrair a física pura (physics_tick). Se o refactor mudar qualquer coisa do
comportamento — que o treino do PPO depende —, os números divergem e o teste quebra.
"""
import numpy as np

from pong_ai.env import H, PADDLE_H, W, PongEnv, physics_tick
from pong_ai.net import RuleBasedNet


def _chase(obs: np.ndarray) -> int:
    return 0 if obs[4] > obs[1] else 1


def test_pongenv_characterization():
    """Rollout determinístico (10 seeds, política chase vs rule-based) reproduz o golden."""
    env = PongEnv(opponent=RuleBasedNet(deadband=40.0))
    tot_r, tot_hits, tot_steps, results = 0.0, 0, 0, []
    for seed in range(10):
        obs, _ = env.reset(seed=seed)
        while True:
            obs, r, term, trunc, info = env.step(_chase(obs))
            tot_r += r
            tot_steps += 1
            if term or trunc:
                tot_hits += info["hits"]
                results.append(info["result"])
                break

    assert abs(tot_r - 5.507445) < 1e-4, tot_r
    assert tot_hits == 70, tot_hits
    assert tot_steps == 6320, tot_steps
    assert results == [-1] * 10, results


def test_physics_tick_rebate_direita():
    """Bola indo pra direita, alinhada ao paddle da IA → rebatida (hit=1, reward>0, vx inverte)."""
    state = {
        "ball":   {"x": 760.0, "y": 300.0, "vx": 5.0, "vy": 0.0},
        "player": {"y": (H - PADDLE_H) / 2.0},
        "ai":     {"y": 300.0 - PADDLE_H / 2.0},  # paddle centrado na bola
    }
    reward, result, hit = physics_tick(state, ai_action=2, opp_action=2)
    assert hit == 1, hit
    assert reward > 0.0, reward
    assert result == 0, result
    assert state["ball"]["vx"] < 0, state["ball"]["vx"]  # quicou pra esquerda


def test_physics_tick_gol_sofrido():
    """Bola cruzando a borda direita → IA sofre gol (result=-1, reward=-5)."""
    state = {
        "ball":   {"x": float(W) - 1.0, "y": 50.0, "vx": 6.0, "vy": 0.0},
        "player": {"y": (H - PADDLE_H) / 2.0},
        "ai":     {"y": 500.0},  # paddle longe da bola, não rebate
    }
    reward, result, hit = physics_tick(state, ai_action=2, opp_action=2)
    assert result == -1, result
    assert reward == -5.0, reward
    assert hit == 0, hit


def _run_all():
    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    for t in tests:
        t()
        print(f"ok  {t.__name__}")
    print(f"\n{len(tests)} passed")


if __name__ == "__main__":
    _run_all()
