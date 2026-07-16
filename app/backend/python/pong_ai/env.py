import os

import gymnasium as gym
import numpy as np
import torch
import torch.nn as nn
from gymnasium import spaces

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


class PongEnv(gym.Env):
    """
    Ambiente Pong para treino via self-play.

    Observação (6 valores normalizados em [-1, 1]):
        ball_x, ball_y, ball_vx, ball_vy, ai_y, player_y

    Ações (Discrete 3):
        0 = cima, 1 = baixo, 2 = parado

    Recompensa (do ponto de vista da IA direita):
        +10.0  IA pontua (bola sai pelo lado esquerdo)
         -1.0  IA leva ponto (bola sai pelo lado direito)
         +1.0  IA rebate nas pontas (|relative| > 0.5)
         -0.6  IA rebate no centro  (|relative| <= 0.5)

    O oponente (lado esquerdo) usa a mesma rede com observação espelhada.

    Cada step aplica a ação por ACTION_REPEAT ticks da física (cadência de
    produção); a recompensa é a soma dos ticks.
    """

    metadata = {"render_modes": []}

    def __init__(self, opponent: nn.Module):
        super().__init__()
        self.observation_space = spaces.Box(low=-1.0, high=1.0, shape=(6,), dtype=np.float32)
        self.action_space = spaces.Discrete(3)
        self.opponent = opponent
        self._state: dict = {}
        self._steps: int = 0

    def reset(self, *, seed=None, options=None):
        super().reset(seed=seed)
        self._state = {
            "ball": {"x": W / 2.0, "y": H / 2.0, "vx": 4.0,
                     "vy": float(self.np_random.choice([-3.0, 3.0]))},
            "player": {"y": (H - PADDLE_H) / 2.0},
            "ai":     {"y": (H - PADDLE_H) / 2.0},
        }
        self._steps = 0
        return self._observe(), {}

    def step(self, action: int):
        opponent_action = self._opponent_action()
        reward = 0.0
        terminated = False

        for _ in range(ACTION_REPEAT):
            self._steps += 1
            self._move_ai(action)
            self._move_opponent(opponent_action)
            self._move_ball()
            r, terminated = self._handle_collisions()
            reward += r
            if terminated:
                break

        return self._observe(), reward, terminated, self._steps >= MAX_STEPS, {}

    # ── movimentação ────────────────────────────────────────────────────────────

    def _move_ai(self, action: int) -> None:
        ai_y = self._state["ai"]["y"]
        if action == 0:
            ai_y = max(0.0, ai_y - PADDLE_SPEED)
        elif action == 1:
            ai_y = min(H - PADDLE_H, ai_y + PADDLE_SPEED)
        self._state["ai"]["y"] = ai_y

    def _opponent_action(self) -> int:
        with torch.no_grad():
            t = torch.FloatTensor(self._observe_opponent()).unsqueeze(0)
            return int(self.opponent(t).argmax(dim=1).item())

    def _move_opponent(self, action: int) -> None:
        player_y = self._state["player"]["y"]
        if action == 0:
            player_y = max(0.0, player_y - PADDLE_SPEED)
        elif action == 1:
            player_y = min(H - PADDLE_H, player_y + PADDLE_SPEED)
        self._state["player"]["y"] = player_y

    def _move_ball(self) -> None:
        ball = self._state["ball"]
        ball["x"] += ball["vx"]
        ball["y"] += ball["vy"]
        if ball["y"] - BALL_R <= 0:
            ball["y"] = float(BALL_R)
            ball["vy"] = abs(ball["vy"])
        elif ball["y"] + BALL_R >= H:
            ball["y"] = float(H - BALL_R)
            ball["vy"] = -abs(ball["vy"])

    # ── colisões e pontuação ─────────────────────────────────────────────────────

    def _handle_collisions(self) -> tuple[float, bool]:
        ball = self._state["ball"]
        reward = 0.0

        self._handle_player_paddle(ball)
        reward = self._handle_ai_paddle(ball, reward)
        reward, terminated = self._handle_scoring(ball, reward)

        return reward, terminated

    def _handle_player_paddle(self, ball: dict) -> None:
        s = self._state
        if (ball["vx"] < 0
                and ball["x"] - BALL_R <= PLAYER_X + PADDLE_W
                and s["player"]["y"] <= ball["y"] <= s["player"]["y"] + PADDLE_H):
            relative = (ball["y"] - (s["player"]["y"] + PADDLE_H / 2.0)) / (PADDLE_H / 2.0)
            ball["x"] = float(PLAYER_X + PADDLE_W + BALL_R)
            ball["vx"] = min(abs(ball["vx"]) * BALL_ACCEL, MAX_BALL_SPEED)
            ball["vy"] = relative * 5.0

    def _handle_ai_paddle(self, ball: dict, reward: float) -> float:
        s = self._state
        if (ball["vx"] > 0
                and ball["x"] + BALL_R >= AI_X
                and s["ai"]["y"] <= ball["y"] <= s["ai"]["y"] + PADDLE_H):
            relative = (ball["y"] - (s["ai"]["y"] + PADDLE_H / 2.0)) / (PADDLE_H / 2.0)
            ball["x"] = float(AI_X - BALL_R)
            ball["vx"] = -min(abs(ball["vx"]) * BALL_ACCEL, MAX_BALL_SPEED)
            ball["vy"] = relative * 5.0
            reward = -10 if abs(relative) <= 0.85 else 10.0
        return reward

    def _handle_scoring(self, ball: dict, reward: float) -> tuple[float, bool]:
        if ball["x"] > W:
            return -1.0, True
        if ball["x"] < 0:
            ball["x"] = W / 2.0
            ball["y"] = H / 2.0
            ball["vx"] = 4.0
            ball["vy"] = float(self.np_random.choice([-3.0, 3.0]))
            return 10.0, False
        return reward, False

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
