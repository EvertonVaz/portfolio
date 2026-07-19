import logging

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.distributions import Categorical

from pong_ai.net import QNetwork, forward_with_activations

logger = logging.getLogger(__name__)


class ValueNetwork(nn.Module):
    """Crítico: estima V(s) para o cálculo de advantage (GAE)."""

    def __init__(self, state_dim: int = 6):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(state_dim, 16),
            nn.ReLU(),
            nn.Linear(16, 16),
            nn.ReLU(),
            nn.Linear(16, 1),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x).squeeze(-1)


class PPOAgent:
    """
    Proximal Policy Optimization (clipped surrogate) com actor e crítico separados.

    A política é a mesma QNetwork do ES (6→16→16→3), então o pipeline de
    nn_viz do frontend e a interface de inferência do main.py não mudam:
        predict(state) → int
        predict_with_activations(state) → (int, list)
        save(path) / load(path)
    """

    def __init__(
        self,
        state_dim:      int   = 6,
        action_dim:     int   = 3,
        lr:             float = 3e-4,
        gamma:          float = 0.99,
        gae_lambda:     float = 0.95,
        clip_eps:       float = 0.2,
        epochs:         int   = 4,
        minibatch_size: int   = 256,
        entropy_coef:   float = 0.01,
        value_coef:     float = 0.5,
        max_grad_norm:  float = 0.5,
    ):
        self.gamma          = gamma
        self.gae_lambda     = gae_lambda
        self.clip_eps       = clip_eps
        self.epochs         = epochs
        self.minibatch_size = minibatch_size
        self.entropy_coef   = entropy_coef
        self.value_coef     = value_coef
        self.max_grad_norm  = max_grad_norm
        self.global_step    = 0

        self.policy = QNetwork(state_dim, action_dim)
        self.value  = ValueNetwork(state_dim)
        self.optimizer = optim.Adam(
            list(self.policy.parameters()) + list(self.value.parameters()), lr=lr
        )

    # ── coleta (treino) ──────────────────────────────────────────────────────

    @torch.no_grad()
    def act(self, obs: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Amostra ações para um batch de observações (N, 6).

        Retorna (actions, logprobs, values) — tudo numpy (N,).
        """
        t      = torch.FloatTensor(obs)
        dist   = Categorical(logits=self.policy(t))
        action = dist.sample()
        return (
            action.numpy(),
            dist.log_prob(action).numpy(),
            self.value(t).numpy(),
        )

    @torch.no_grad()
    def estimate_values(self, obs: np.ndarray) -> np.ndarray:
        return self.value(torch.FloatTensor(obs)).numpy()

    def compute_gae(
        self,
        rewards:     np.ndarray,  # (T, N)
        values:      np.ndarray,  # (T, N)
        dones:       np.ndarray,  # (T, N) — done após o step t
        last_values: np.ndarray,  # (N,)   — V(obs) após o último step
    ) -> tuple[np.ndarray, np.ndarray]:
        """Generalized Advantage Estimation. Retorna (advantages, returns), shape (T, N)."""
        T = len(rewards)
        advantages = np.zeros_like(rewards)
        lastgaelam = np.zeros(rewards.shape[1], dtype=np.float32)

        for t in reversed(range(T)):
            next_values      = last_values if t == T - 1 else values[t + 1]
            next_nonterminal = 1.0 - dones[t]
            delta = rewards[t] + self.gamma * next_values * next_nonterminal - values[t]
            lastgaelam = delta + self.gamma * self.gae_lambda * next_nonterminal * lastgaelam
            advantages[t] = lastgaelam

        return advantages, advantages + values

    # ── atualização ──────────────────────────────────────────────────────────

    def update(
        self,
        obs:          np.ndarray,  # (B, 6)
        actions:      np.ndarray,  # (B,)
        old_logprobs: np.ndarray,  # (B,)
        advantages:   np.ndarray,  # (B,)
        returns:      np.ndarray,  # (B,)
    ) -> dict:
        obs_t      = torch.FloatTensor(obs)
        actions_t  = torch.LongTensor(actions)
        old_lp_t   = torch.FloatTensor(old_logprobs)
        adv_t      = torch.FloatTensor(advantages)
        returns_t  = torch.FloatTensor(returns)

        adv_t = (adv_t - adv_t.mean()) / (adv_t.std() + 1e-8)

        n   = len(obs)
        idx = np.arange(n)
        policy_loss = value_loss = entropy = torch.tensor(0.0)

        for _ in range(self.epochs):
            np.random.shuffle(idx)
            for start in range(0, n, self.minibatch_size):
                mb = idx[start:start + self.minibatch_size]

                dist     = Categorical(logits=self.policy(obs_t[mb]))
                logprobs = dist.log_prob(actions_t[mb])
                ratio    = (logprobs - old_lp_t[mb]).exp()

                surr1 = ratio * adv_t[mb]
                surr2 = torch.clamp(ratio, 1.0 - self.clip_eps, 1.0 + self.clip_eps) * adv_t[mb]

                policy_loss = -torch.min(surr1, surr2).mean()
                value_loss  = nn.functional.mse_loss(self.value(obs_t[mb]), returns_t[mb])
                entropy     = dist.entropy().mean()

                loss = policy_loss + self.value_coef * value_loss - self.entropy_coef * entropy

                self.optimizer.zero_grad()
                loss.backward()
                nn.utils.clip_grad_norm_(
                    list(self.policy.parameters()) + list(self.value.parameters()),
                    self.max_grad_norm,
                )
                self.optimizer.step()

        return {
            "policy_loss": float(policy_loss.detach()),
            "value_loss":  float(value_loss.detach()),
            "entropy":     float(entropy.detach()),
        }

    # ── inferência (produção) ────────────────────────────────────────────────

    def predict(self, state: np.ndarray) -> int:
        with torch.no_grad():
            t = torch.FloatTensor(state).unsqueeze(0)
            return int(self.policy(t).argmax(dim=1).item())

    def predict_with_activations(
        self, state: np.ndarray
    ) -> tuple[int, list[list[float]]]:
        return forward_with_activations(self.policy, state)

    # ── persistência ─────────────────────────────────────────────────────────

    def save(self, path: str) -> None:
        torch.save({
            "policy":      self.policy.state_dict(),
            "value":       self.value.state_dict(),
            "global_step": self.global_step,
        }, path)

    def load(self, path: str) -> None:
        data = torch.load(path, map_location="cpu", weights_only=True)
        self.policy.load_state_dict(data["policy"])
        self.value.load_state_dict(data["value"])
        self.global_step = int(data.get("global_step", 0))
        logger.info("PPOAgent loaded ← %s (global_step %d)", path, self.global_step)
