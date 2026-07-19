import os

import gymnasium as gym
import numpy as np
import torch
import torch.nn as nn
from gymnasium import spaces
from gymnasium.vector import AutoresetMode

W            = int(os.getenv("GAME_WIDTH",    "800"))
H            = int(os.getenv("GAME_HEIGHT",   "600"))
PADDLE_W     = int(os.getenv("PADDLE_WIDTH",  "12"))
PADDLE_H     = int(os.getenv("PADDLE_HEIGHT", "80"))
PADDLE_SPEED = float(os.getenv("PADDLE_SPEED", "5.0"))
BALL_R       = int(os.getenv("BALL_RADIUS",   "8"))
PLAYER_X     = int(os.getenv("PLAYER_X",      "20"))
AI_X         = int(os.getenv("AI_X",          "768"))
MAX_BALL_SPEED = float(os.getenv("MAX_BALL_SPEED", "10.0"))
BALL_ACCEL   = float(os.getenv("BALL_ACCEL",  "1.05"))
MAX_STEPS    = int(os.getenv("MAX_STEPS",     "200000"))

# Em produção o Elixir publica estado a cada 3 ticks (@ai_publish_every) e a
# direção persiste entre mensagens — aqui cada step decide 1 ação e segura
# por 3 ticks da física, eliminando o sim-to-real gap de cadência.
ACTION_REPEAT = 3


# ── física pura (fonte única, reusada pelo PongEnv e pela arena do train_server) ──
# Funções sem estado de classe: operam in place sobre
#   state = {"ball": {x, y, vx, vy}, "player": {y}, "ai": {y}}
# na perspectiva da IA à direita. "player" é o paddle esquerdo (oponente).

def move_paddle(y: float, action: int) -> float:
    """Move um paddle 1 tick: 0=cima, 1=baixo, 2=parado. Clampa nas bordas."""
    if action == 0:
        return max(0.0, y - PADDLE_SPEED)
    if action == 1:
        return min(H - PADDLE_H, y + PADDLE_SPEED)
    return y


def _step_ball(ball: dict) -> None:
    """Avança a bola 1 tick e resolve o quique nas paredes de cima/baixo."""
    ball["x"] += ball["vx"]
    ball["y"] += ball["vy"]
    if ball["y"] - BALL_R <= 0:
        ball["y"] = float(BALL_R)
        ball["vy"] = abs(ball["vy"])
    elif ball["y"] + BALL_R >= H:
        ball["y"] = float(H - BALL_R)
        ball["vy"] = -abs(ball["vy"])


def _bounce_left(ball: dict, paddle_y: float) -> None:
    """Colisão no paddle esquerdo (oponente) — sem recompensa (não é a IA)."""
    if (ball["vx"] < 0
            and ball["x"] - BALL_R <= PLAYER_X + PADDLE_W
            and paddle_y <= ball["y"] <= paddle_y + PADDLE_H):
        relative = (ball["y"] - (paddle_y + PADDLE_H / 2.0)) / (PADDLE_H / 2.0)
        ball["x"] = float(PLAYER_X + PADDLE_W + BALL_R)
        ball["vx"] = min(abs(ball["vx"]) * BALL_ACCEL, MAX_BALL_SPEED)
        ball["vy"] = relative * 5.0


def _bounce_right(ball: dict, paddle_y: float) -> tuple[float, int]:
    """Colisão no paddle direito (IA). Retorna (reward, hit): reward cresce com |relative|."""
    if (ball["vx"] > 0
            and ball["x"] + BALL_R >= AI_X
            and paddle_y <= ball["y"] <= paddle_y + PADDLE_H):
        relative = (ball["y"] - (paddle_y + PADDLE_H / 2.0)) / (PADDLE_H / 2.0)
        ball["x"] = float(AI_X - BALL_R)
        ball["vx"] = -min(abs(ball["vx"]) * BALL_ACCEL, MAX_BALL_SPEED)
        ball["vy"] = relative * 5.0
        return 0.5 + 0.5 * abs(relative), 1
    return 0.0, 0


def physics_tick(state: dict, ai_action: int, opp_action: int) -> tuple[float, int, int]:
    """Avança UM tick completo da física, in place em `state`.

    Move os dois paddles e a bola, resolve colisões e pontuação (perspectiva da IA
    à direita). Devolve (reward, result, hit):
        result +1 IA marca, -1 IA sofre gol, 0 nenhum; hit 1 se a IA rebateu.
    Não faz reset nem termina episódio — quem chama decide (PongEnv encerra o ponto,
    a arena reinicia a bola e soma o placar).
    """
    state["ai"]["y"]     = move_paddle(state["ai"]["y"], ai_action)
    state["player"]["y"] = move_paddle(state["player"]["y"], opp_action)

    ball = state["ball"]
    _step_ball(ball)
    _bounce_left(ball, state["player"]["y"])
    reward, hit = _bounce_right(ball, state["ai"]["y"])

    result = 0
    if ball["x"] > W:
        reward -= 5.0
        result = -1   # IA sofre gol
    elif ball["x"] < 0:
        reward += 5.0
        result = +1   # IA marca
    return reward, result, hit


class PongEnv(gym.Env):
    """
    Ambiente Pong para treino via self-play.

    Observação (6 valores normalizados em [-1, 1]):
        ball_x, ball_y, ball_vx, ball_vy, ai_y, player_y

    Ações (Discrete 3):
        0 = cima, 1 = baixo, 2 = parado

    Recompensa (do ponto de vista da IA direita):
        +5.0  IA marca (bola sai pelo lado esquerdo)  — encerra o ponto
        -5.0  IA sofre gol (bola sai pelo lado direito) — encerra o ponto
        +0.5 a +1.0  IA rebate — cresce linearmente com |relative|
                     (0.5 no centro do paddle, 1.0 nas pontas)

    Cada episódio é UM ponto: termina quando qualquer lado marca (crédito
    temporal limpo — o retorno do episódio = rebatidas ± resultado do ponto).

    O oponente (lado esquerdo) usa a mesma rede com observação espelhada.

    Cada step aplica a ação por ACTION_REPEAT ticks da física (cadência de
    produção); a recompensa é a soma dos ticks.

    info em cada step:
        hits:   rebatidas acumuladas da IA no episódio (cumulativo)
        result: 0 durante o ponto; +1 se a IA marca; -1 se sofre gol
    """

    metadata = {"render_modes": [], "autoreset_mode": AutoresetMode.SAME_STEP}

    def __init__(self, opponent: nn.Module):
        super().__init__()
        self.observation_space = spaces.Box(low=-1.0, high=1.0, shape=(6,), dtype=np.float32)
        self.action_space = spaces.Discrete(3)
        self.opponent = opponent
        self._state: dict = {}
        self._steps: int = 0
        self._ep_hits: int = 0

    def reset(self, *, seed=None, options=None):
        super().reset(seed=seed)
        self._state = {
            "ball": {"x": W / 2.0, "y": H / 2.0, "vx": 4.0,
                     "vy": float(self.np_random.choice([-3.0, 3.0]))},
            "player": {"y": (H - PADDLE_H) / 2.0},
            "ai":     {"y": (H - PADDLE_H) / 2.0},
        }
        self._steps = 0
        self._ep_hits = 0
        return self._observe(), {"hits": 0, "result": 0}

    def step(self, action: int):
        opponent_action = self._opponent_action()
        reward = 0.0
        terminated = False
        result = 0

        for _ in range(ACTION_REPEAT):
            self._steps += 1
            r, res, hit = physics_tick(self._state, action, opponent_action)
            reward += r
            self._ep_hits += hit
            if res != 0:
                result = res
                terminated = True
                break

        info = {"hits": self._ep_hits, "result": result}
        return self._observe(), reward, terminated, self._steps >= MAX_STEPS, info

    def _opponent_action(self) -> int:
        with torch.no_grad():
            t = torch.FloatTensor(self._observe_opponent()).unsqueeze(0)
            return int(self.opponent(t).argmax(dim=1).item())

    # ── observações ──────────────────────────────────────────────────────────────

    def _observe(self) -> np.ndarray:
        b = self._state["ball"]
        return np.array([
            b["x"] / W * 2.0 - 1.0,
            b["y"] / H * 2.0 - 1.0,
            b["vx"] / MAX_BALL_SPEED,
            b["vy"] / MAX_BALL_SPEED,
            self._state["ai"]["y"]     / (H - PADDLE_H) * 2.0 - 1.0,
            self._state["player"]["y"] / (H - PADDLE_H) * 2.0 - 1.0,
        ], dtype=np.float32)

    def _observe_opponent(self) -> np.ndarray:
        """Observação do ponto de vista do oponente (lado esquerdo): eixo X espelhado."""
        b = self._state["ball"]
        return np.array([
            (W - b["x"]) / W * 2.0 - 1.0,
            b["y"] / H * 2.0 - 1.0,
            -b["vx"] / MAX_BALL_SPEED,
            b["vy"] / MAX_BALL_SPEED,
            self._state["player"]["y"] / (H - PADDLE_H) * 2.0 - 1.0,
            self._state["ai"]["y"]     / (H - PADDLE_H) * 2.0 - 1.0,
        ], dtype=np.float32)
