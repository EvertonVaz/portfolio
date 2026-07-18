"""Avaliação no PongEnv e formatação de log compartilhadas entre ES e PPO.

O objetivo é que os dois treinos reportem as MESMAS métricas de comportamento,
medidas do mesmo jeito (agente greedy no PongEnv contra a mesma âncora), para
serem diretamente comparáveis. Cada algoritmo anexa seus extras específicos.
"""
from collections.abc import Callable

import numpy as np

from pong_ai.env import PongEnv

# Seeds fixas para a avaliação de log: entre gerações/rollouts, a variação das
# métricas reflete melhora do agente, não mudança do sorteio do estado inicial.
EVAL_SEEDS = [1_000_000 + i for i in range(20)]

# Deadband (px) da âncora rule-based compartilhada por ES e PPO. Handicap: com
# ~2px o oponente é imbatível e satura fitness e log (placar sempre 20-0); ~40px
# o deixa errar às vezes, dando dinâmica ao treino e ao log de ambos.
ANCHOR_DEADBAND = 40.0


def evaluate_in_env(action_fn: Callable[[np.ndarray], int], opponent, seeds: list[int]) -> dict:
    """Joga um ponto por seed no PongEnv (agente greedy) e agrega métricas.

    action_fn(obs) -> int decide a ação do agente avaliado.
    Todas as métricas são de comportamento observável, comparáveis entre ES e PPO:
        n_pts, return (médio/episódio), pts_len (env-steps), hits/pt, win%, act (contagem 3).
    """
    env = PongEnv(opponent=opponent)
    rets: list[float] = []
    lens: list[int] = []
    hits: list[int] = []
    wins: list[int] = []
    act = np.zeros(3, dtype=np.int64)

    for seed in seeds:
        obs, _ = env.reset(seed=seed)
        total, steps = 0.0, 0
        info = {"hits": 0, "result": 0}
        while True:
            a = action_fn(obs)
            act[a] += 1
            obs, r, terminated, truncated, info = env.step(a)
            total += float(r)
            steps += 1
            if terminated or truncated:
                break
        rets.append(total)
        lens.append(steps)
        hits.append(int(info["hits"]))
        wins.append(1 if info["result"] > 0 else 0)

    return {
        "n_pts":   len(seeds),
        "return":  float(np.mean(rets)),
        "pts_len": float(np.mean(lens)),
        "hits":    float(np.mean(hits)),
        "win":     100.0 * float(np.mean(wins)),
        "act":     act,
    }


def format_log(label: str, step: int, total: int, m: dict, extra: str = "") -> str:
    """Linha de log padronizada (métricas de comportamento) + extras do algoritmo.

    Legenda das métricas (todas medidas com o agente greedy no PongEnv, contra a
    mesma âncora rule-based, então ES e PPO são diretamente comparáveis):
        label step/total  progresso do treino (gen do ES / global_step do PPO).
        pts       nº de pontos jogados na avaliação (= len(EVAL_SEEDS)).
        return    retorno médio por ponto — a recompensa que o treino otimiza.
                  Sobe conforme o agente rebate mais e concede menos.
        pts_len   duração média do ponto em env-steps. Rallies mais longos ⇒
                  agente sobrevive mais (não é furado de primeira).
        hits/pt   rebatidas por ponto. Mede se o agente ao menos intercepta a
                  bola; ~1.0 já é rebater com consistência.
        win%      % de pontos vencidos (agente marca em vez de conceder).
        act[↑↓·]  distribuição das ações greedy (cima/baixo/parado). Expõe
                  colapso de política — uma ação perto de 100% indica que o
                  agente travou num movimento só.
    O `extra` traz as métricas específicas de cada algoritmo:

    ES (train_es.py):
        sigma     desvio da perturbação dos pesos na geração (decai ao longo do
                  treino: explora no início, refina no fim).
        fit(hof)  fitness do agente atual (retorno médio/episódio) contra o pool
                  de oponentes do hall of fame, nas EVAL_SEEDS fixas.
        pop_std   desvio-padrão do fitness na população. ~0 ⇒ colapso (todos os
                  candidatos jogam igual, ES sem gradiente); >0 ⇒ há variação
                  para o ES escalar.
        hof       tamanho do hall of fame (âncora rule-based + snapshots).

    PPO (train_ppo.py):
        train_ret retorno médio dos últimos ~200 episódios do self-play (não do
                  eval greedy) — sinal bruto de aprendizado durante o rollout.
        ent       entropia da política. Alta ⇒ ainda explora; cair rápido demais
                  antecipa colapso (por isso o entropy_coef segura ela).
        v_ev      explained variance do crítico: 1.0 = V(s) prevê os retornos na
                  perfeição, 0 = inútil, <0 = pior que prever a média.
        v_loss    perda do crítico (MSE de V(s) vs retornos observados).
    """
    a = m["act"]
    s = int(max(a.sum(), 1))
    return (
        f"{label} {step}/{total} | pts={m['n_pts']} | return={m['return']:.2f} | "
        f"pts_len={m['pts_len']:.0f} | hits/pt={m['hits']:.2f} | win={m['win']:.0f}% | "
        f"act[↑↓·]={round(100 * a[0] / s)}/{round(100 * a[1] / s)}/{round(100 * a[2] / s)}%"
        f"{extra}"
    )
