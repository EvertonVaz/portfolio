import gymnasium as gym
import numpy as np
from gymnasium import spaces

# Espelha exatamente as constantes do GameServer Elixir
W, H = 800, 600
PADDLE_W, PADDLE_H = 12, 80
PADDLE_SPEED = 5.0
BALL_R = 8
PLAYER_X = 20
AI_X = 768
MAX_BALL_SPEED = 10.0
MAX_STEPS = 2000


class PongEnv(gym.Env):
    """
    Ambiente Pong para treino do agente DQN.

    Observação (6 valores normalizados em [-1, 1]):
        ball_x, ball_y, ball_vx, ball_vy, ai_y, player_y

    Ações (Discrete 3):
        0 = cima, 1 = baixo, 2 = parado

    Recompensa:
        +1.0  quando a raquete IA rebate a bola
        -1.0  quando a IA perde o ponto (bola sai pelo lado direito)
    """

    metadata = {"render_modes": []}

    def __init__(self):
        super().__init__()
        self.observation_space = spaces.Box(low=-1.0, high=1.0, shape=(6,), dtype=np.float32)
        self.action_space = spaces.Discrete(3)
        self._state: dict = {}
        self._steps: int = 0

    def reset(self, *, seed=None, options=None):
        super().reset(seed=seed)
        rng = self.np_random
        vy = float(rng.choice([-3.0, 3.0]))
        self._state = {
            "ball": {"x": W / 2.0, "y": H / 2.0, "vx": 4.0, "vy": vy},
            "player": {"y": (H - PADDLE_H) / 2.0},
            "ai": {"y": (H - PADDLE_H) / 2.0},
        }
        self._steps = 0
        return self._observe(), {}

    def step(self, action: int):
        self._steps += 1
        s = self._state
        ball = s["ball"]

        # Move raquete IA com a ação escolhida
        ai_y = s["ai"]["y"]
        if action == 0:
            ai_y = max(0.0, ai_y - PADDLE_SPEED)
        elif action == 1:
            ai_y = min(H - PADDLE_H, ai_y + PADDLE_SPEED)
        s["ai"]["y"] = ai_y

        # Oponente rule-based (jogador) — espelha RuleBasedAI do Elixir
        player_y = s["player"]["y"]
        target = ball["y"] - PADDLE_H / 2.0
        if player_y < target - 2:
            player_y = min(H - PADDLE_H, player_y + PADDLE_SPEED)
        elif player_y > target + 2:
            player_y = max(0.0, player_y - PADDLE_SPEED)
        s["player"]["y"] = player_y

        # Move bola
        ball["x"] += ball["vx"]
        ball["y"] += ball["vy"]

        # Rebate paredes
        if ball["y"] - BALL_R <= 0:
            ball["y"] = float(BALL_R)
            ball["vy"] = abs(ball["vy"])
        elif ball["y"] + BALL_R >= H:
            ball["y"] = float(H - BALL_R)
            ball["vy"] = -abs(ball["vy"])

        reward = 0.0
        terminated = False

        # Rebate raquete do jogador (esquerda)
        if (ball["vx"] < 0
                and ball["x"] - BALL_R <= PLAYER_X + PADDLE_W
                and s["player"]["y"] <= ball["y"] <= s["player"]["y"] + PADDLE_H):
            relative = (ball["y"] - (s["player"]["y"] + PADDLE_H / 2.0)) / (PADDLE_H / 2.0)
            ball["x"] = float(PLAYER_X + PADDLE_W + BALL_R)
            ball["vx"] = abs(ball["vx"])
            ball["vy"] = relative * 5.0

        # Rebate raquete da IA (direita)
        if (ball["vx"] > 0
                and ball["x"] + BALL_R >= AI_X
                and s["ai"]["y"] <= ball["y"] <= s["ai"]["y"] + PADDLE_H):
            relative = (ball["y"] - (s["ai"]["y"] + PADDLE_H / 2.0)) / (PADDLE_H / 2.0)
            ball["x"] = float(AI_X - BALL_R)
            ball["vx"] = -abs(ball["vx"])
            ball["vy"] = relative * 5.0
            reward = 1.0

        # Saiu pelo lado direito → IA perdeu o ponto
        if ball["x"] > W:
            reward = -1.0
            terminated = True
        # Saiu pelo lado esquerdo → IA ganhou o ponto (episódio continua)
        elif ball["x"] < 0:
            ball["x"] = W / 2.0
            ball["y"] = H / 2.0
            ball["vx"] = 4.0
            ball["vy"] = float(self.np_random.choice([-3.0, 3.0]))

        truncated = self._steps >= MAX_STEPS
        return self._observe(), reward, terminated, truncated, {}

    def _observe(self) -> np.ndarray:
        b = self._state["ball"]
        ai_y = self._state["ai"]["y"]
        pl_y = self._state["player"]["y"]
        return np.array([
            b["x"] / W * 2.0 - 1.0,
            b["y"] / H * 2.0 - 1.0,
            b["vx"] / MAX_BALL_SPEED,
            b["vy"] / MAX_BALL_SPEED,
            ai_y / (H - PADDLE_H) * 2.0 - 1.0,
            pl_y / (H - PADDLE_H) * 2.0 - 1.0,
        ], dtype=np.float32)
