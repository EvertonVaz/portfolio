"""Blocos de rede compartilhados por GA e PPO.

Contém a política (QNetwork), o oponente rule-based (RuleBasedNet), a captura de
ativações pro nn_viz do frontend, e um agente de inferência (GAAgent) que carrega
um genoma treinado pelo GA e joga greedy — o mesmo comportamento de produção.
"""
import logging

import numpy as np
import torch
import torch.nn as nn

from pong_ai.env import H, PADDLE_H

logger = logging.getLogger(__name__)


class QNetwork(nn.Module):
    """MLP 6→16→16→3 usada como política do agente."""

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


def set_flat_params(net: QNetwork, params: np.ndarray) -> None:
    """Escreve um vetor achatado de pesos numa QNetwork existente (in place)."""
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
    """Oponente determinístico que segue a bola.

    deadband: zona morta em px — só corrige a posição se o paddle estiver a mais
    de `deadband` do alvo. Maior = oponente mais lento/humano, deixando a bola
    escapar às vezes (dá chance de o agente marcar). Com ~2px é quase perfeito.
    """

    def __init__(self, deadband: float = 2.0):
        super().__init__()
        self.deadband = deadband

    def forward(self, obs: torch.Tensor) -> torch.Tensor:
        # obs: (batch, 6) na perspectiva do oponente
        # obs[...,1] = ball_y_norm, obs[...,4] = paddle_y_norm
        ball_y   = (obs[..., 1] + 1.0) * 0.5 * H
        paddle_y = (obs[..., 4] + 1.0) * 0.5 * (H - PADDLE_H)
        target   = ball_y - PADDLE_H * 0.5
        diff     = paddle_y - target  # >0: paddle acima do alvo → subir; <0: abaixo → descer

        batch  = obs.shape[0]
        logits = torch.zeros(batch, 3, device=obs.device)

        up_mask   = diff >  self.deadband
        down_mask = diff < -self.deadband
        stop_mask = ~(up_mask | down_mask)

        logits[up_mask,   0] = 1.0  # action 0 = cima
        logits[down_mask, 1] = 1.0  # action 1 = baixo
        logits[stop_mask, 2] = 1.0  # action 2 = parado
        return logits


class GAAgent:
    """Inferência de um genoma treinado pelo GA (train_ga).

    Carrega os pesos numa QNetwork e joga greedy (argmax) — idêntico à produção.
    Interface espelha a do PPOAgent usada pelo main.py:
        predict(state) → int
        predict_with_activations(state) → (int, list)
        load(path)
    """

    def __init__(self, state_dim: int = 6, action_dim: int = 3):
        self.net = QNetwork(state_dim, action_dim)
        self.net.eval()
        self.net.requires_grad_(False)

    def predict(self, state: np.ndarray) -> int:
        with torch.no_grad():
            t = torch.FloatTensor(state).unsqueeze(0)
            return int(self.net(t).argmax(dim=1).item())

    def predict_with_activations(
        self, state: np.ndarray
    ) -> tuple[int, list[list[float]]]:
        return forward_with_activations(self.net, state)

    def load(self, path: str) -> None:
        data = torch.load(path, map_location="cpu", weights_only=True)
        params = data["params"].numpy().astype(np.float32)
        set_flat_params(self.net, params)
        self.net.eval()
        self.net.requires_grad_(False)
        logger.info("GAAgent loaded ← %s (generation %d)", path, int(data.get("generation", 0)))
