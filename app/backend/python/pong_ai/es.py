import logging

import numpy as np
import torch
import torch.nn as nn

from pong_ai.env import H, PADDLE_H

logger = logging.getLogger(__name__)


class QNetwork(nn.Module):
    """MLP 6→16→16→3 usada como política do agente ES."""

    def __init__(self, state_dim: int = 6, action_dim: int = 3):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(state_dim, 16),
            nn.ReLU(),
            nn.Linear(16, 16),
            nn.ReLU(),
            nn.Linear(16, action_dim),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


def forward_with_activations(net: QNetwork, state: np.ndarray) -> tuple[int, list[list[float]]]:
    """Retorna (action, [input, hidden1, hidden2, output]) para o nn_viz do frontend."""
    captured: list[np.ndarray] = []
    hooks = []

    def hook(_mod, _inp, out):
        captured.append(out.squeeze(0).cpu().numpy())

    for layer in net.net:
        if isinstance(layer, nn.ReLU):
            hooks.append(layer.register_forward_hook(hook))

    with torch.no_grad():
        t = torch.FloatTensor(state).unsqueeze(0)
        q_values = net(t).squeeze(0).cpu().numpy()

    for h in hooks:
        h.remove()

    action = int(q_values.argmax())
    return action, [
        state.tolist(),
        captured[0].tolist(),
        captured[1].tolist(),
        q_values.tolist(),
    ]


class RuleBasedNet(nn.Module):
    """Oponente determinístico que segue a bola — usado durante a avaliação ES."""

    def forward(self, obs: torch.Tensor) -> torch.Tensor:
        # obs: (batch, 6) na perspectiva do oponente
        # obs[...,1] = ball_y_norm, obs[...,4] = paddle_y_norm
        ball_y   = (obs[..., 1] + 1.0) * 0.5 * H
        paddle_y = (obs[..., 4] + 1.0) * 0.5 * (H - PADDLE_H)
        target   = ball_y - PADDLE_H * 0.5
        diff     = paddle_y - target  # >0: paddle acima do alvo → subir; <0: abaixo → descer

        batch  = obs.shape[0]
        logits = torch.zeros(batch, 3, device=obs.device)

        up_mask   = diff >  2.0
        down_mask = diff < -2.0
        stop_mask = ~(up_mask | down_mask)

        logits[up_mask,   0] = 1.0  # action 0 = cima
        logits[down_mask, 1] = 1.0  # action 1 = baixo
        logits[stop_mask, 2] = 1.0  # action 2 = parado
        return logits


class ESAgent:
    """
    Agente OpenAI Evolution Strategies.

    Interface de inferência usada pelo main.py:
        predict(state) → int
        predict_with_activations(state) → (int, list)
        save(path) / load(path)
    """

    def __init__(
        self,
        state_dim:  int   = 6,
        action_dim: int   = 3,
        sigma:      float = 0.05,
        lr:         float = 0.01,
        pop_size:   int   = 50,
    ):
        self.net        = QNetwork(state_dim, action_dim)
        self.sigma      = sigma
        self.lr         = lr
        self.pop_size   = pop_size
        self.generation = 0
        self.params     = self._flatten()

    # ── gerenciamento de parâmetros ───────────────────────────────────────────

    def _flatten(self) -> np.ndarray:
        return np.concatenate(
            [p.data.cpu().numpy().flatten() for p in self.net.parameters()]
        ).astype(np.float32)

    def _set_params(self, params: np.ndarray) -> None:
        idx = 0
        with torch.no_grad():
            for p in self.net.parameters():
                size = p.numel()
                p.data.copy_(
                    torch.from_numpy(
                        params[idx: idx + size].reshape(p.shape).astype(np.float32)
                    )
                )
                idx += size

    # ── interface ES ──────────────────────────────────────────────────────────

    def ask(self) -> tuple[list[np.ndarray], list[np.ndarray]]:
        """Gera pop_size candidatos com antithetic sampling.

        Para cada ε, gera o par (θ+σε, θ-σε). Isso corta a variância do
        estimador de gradiente em ~50% sem custo extra de avaliações.
        pop_size deve ser par; se ímpar, arredonda para baixo.
        """
        half = self.pop_size // 2
        base_epsilons = [np.random.randn(len(self.params)).astype(np.float32)
                         for _ in range(half)]
        epsilons   = []
        candidates = []
        for eps in base_epsilons:
            epsilons.append(eps)
            epsilons.append(-eps)
            candidates.append(self.params + self.sigma * eps)
            candidates.append(self.params - self.sigma * eps)
        return candidates, epsilons

    def tell(
        self,
        fitness: list[float],
        epsilons: list[np.ndarray],
        truncation: float = 2,
    ) -> None:
        """Atualização ES com truncation selection.

        Usa apenas o top `truncation` da população (padrão 50%).
        Indivíduos abaixo do corte não contribuem para o gradiente,
        reduzindo o ruído sem precisar de mais avaliações.
        """
        n = len(fitness)
        cutoff = int(n * (1.0 - truncation))
        top_indices = np.argsort(fitness)[cutoff:]  # top-K índices

        top_fitness  = [fitness[i]  for i in top_indices]
        top_epsilons = [epsilons[i] for i in top_indices]

        ranks      = np.argsort(np.argsort(top_fitness)).astype(np.float32)
        normalized = ranks / max(len(top_fitness) - 1, 1) - 0.5

        update = np.zeros_like(self.params)
        for f_norm, eps in zip(normalized, top_epsilons):
            update += f_norm * eps

        self.params += (self.lr / (len(top_fitness) * self.sigma)) * update
        self._set_params(self.params)
        self.generation += 1

    # ── inferência ─────────────────────────────────────────────────────────────

    def predict(self, state: np.ndarray) -> int:
        with torch.no_grad():
            t = torch.FloatTensor(state).unsqueeze(0)
            return int(self.net(t).argmax(dim=1).item())

    def predict_with_activations(
        self, state: np.ndarray
    ) -> tuple[int, list[list[float]]]:
        return forward_with_activations(self.net, state)

    # ── persistência ──────────────────────────────────────────────────────────

    def save(self, path: str) -> None:
        torch.save(
            {"params": torch.from_numpy(self.params), "generation": self.generation},
            path,
        )
        logger.info("ESAgent saved → %s (generation %d)", path, self.generation)

    def load(self, path: str) -> None:
        data            = torch.load(path, map_location="cpu", weights_only=True)
        self.params     = data["params"].numpy().astype(np.float32)
        self.generation = int(data.get("generation", 0))
        self._set_params(self.params)
        logger.info("ESAgent loaded ← %s (generation %d)", path, self.generation)
