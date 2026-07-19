import asyncio
import json
import logging
import os
from pathlib import Path

import aio_pika
import numpy as np

from pong_ai.rule_based import compute_direction

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq/")
STATE_QUEUE = "game.state"
ACTION_QUEUE = "game.ai_action"
HEARTBEAT_FILE = Path(os.getenv("HEARTBEAT_FILE", "/tmp/ai-heartbeat"))
HEARTBEAT_INTERVAL_S = 10
_MODELS_DIR     = Path(__file__).parent / "pong_ai" / "models"
_PPO_MODEL_PATH = _MODELS_DIR / "ppo.pt"
_GA_MODEL_PATH  = _MODELS_DIR / "ga.pt"

# Constantes espelhadas do PongEnv — lidas do ambiente para manter sincronismo
_W             = float(os.getenv("GAME_WIDTH",    "800"))
_H             = float(os.getenv("GAME_HEIGHT",   "600"))
_PADDLE_H      = float(os.getenv("PADDLE_HEIGHT", "80"))
_MAX_BALL_SPEED = float(os.getenv("MAX_BALL_SPEED", "10.0"))

_agents: dict = {}


def _load_agents():
    if _PPO_MODEL_PATH.exists():
        try:
            from pong_ai.ppo import PPOAgent
            agent = PPOAgent()
            agent.load(str(_PPO_MODEL_PATH))
            _agents["ppo"] = agent
        except Exception as exc:
            logger.error("Failed to load PPOAgent: %s", exc)

    if _GA_MODEL_PATH.exists():
        try:
            from pong_ai.net import GAAgent
            agent = GAAgent()
            agent.load(str(_GA_MODEL_PATH))
            _agents["ga"] = agent
        except Exception as exc:
            logger.error("Failed to load GAAgent: %s", exc)

    if not _agents:
        logger.warning("No model found — using rule-based AI")


def _agent_for(name: str | None):
    """Retorna (algo, agent) do modelo pedido, ou o primeiro disponível como fallback."""
    if name in _agents:
        return name, _agents[name]
    for key in ("ppo", "ga"):
        if key in _agents:
            return key, _agents[key]
    return None, None


def _state_to_obs(state: dict) -> np.ndarray:
    b = state["ball"]
    ai_y = float(state["ai_y"])
    player_y = float(state.get("player_y", _H / 2.0 - _PADDLE_H / 2.0))
    return np.array([
        b["x"] / _W * 2.0 - 1.0,
        b["y"] / _H * 2.0 - 1.0,
        b["vx"] / _MAX_BALL_SPEED,
        b["vy"] / _MAX_BALL_SPEED,
        ai_y / (_H - _PADDLE_H) * 2.0 - 1.0,
        player_y / (_H - _PADDLE_H) * 2.0 - 1.0,
    ], dtype=np.float32)


def _state_to_obs_mirrored(state: dict) -> np.ndarray:
    """Observação da raquete esquerda: eixo X espelhado, posições trocadas.
    Mesma transformação usada no self-play do treino.
    """
    b = state["ball"]
    ai_y = float(state["ai_y"])
    player_y = float(state.get("player_y", _H / 2.0 - _PADDLE_H / 2.0))
    return np.array([
        (_W - b["x"]) / _W * 2.0 - 1.0,
        b["y"] / _H * 2.0 - 1.0,
        -b["vx"] / _MAX_BALL_SPEED,
        b["vy"] / _MAX_BALL_SPEED,
        player_y / (_H - _PADDLE_H) * 2.0 - 1.0,
        ai_y / (_H - _PADDLE_H) * 2.0 - 1.0,
    ], dtype=np.float32)


_ACTION_TO_DIRECTION = {0: "up", 1: "down", 2: "stop"}
_NN_VIZ_BINS = 16


def _bin(values: list[float], n: int) -> list[float]:
    size = len(values) // n
    return [float(np.mean(values[i * size:(i + 1) * size])) for i in range(n)]


def _compute_direction(state: dict) -> tuple[str, dict | None, str | None]:
    """Retorna (direction, nn_viz, player_direction).

    player_direction só é computada no modo aivai: a mesma rede joga a
    raquete esquerda com observação espelhada (self-play, como no treino).
    """
    aivai = state.get("mode") == "aivai"
    algo, agent = _agent_for(state.get("ai_model"))

    if agent is not None:
        obs = _state_to_obs(state)
        action, raw = agent.predict_with_activations(obs)
        nn_viz = {
            "algo": algo.upper(),
            "layers": [6, _NN_VIZ_BINS, _NN_VIZ_BINS, 3],
            "activations": [
                raw[0],
                _bin(raw[1], _NN_VIZ_BINS),
                _bin(raw[2], _NN_VIZ_BINS),
                raw[3],
            ],
        }
        player_direction = None
        if aivai:
            _, player_agent = _agent_for(state.get("player_model"))
            player_action = player_agent.predict(_state_to_obs_mirrored(state))
            player_direction = _ACTION_TO_DIRECTION[player_action]
        return _ACTION_TO_DIRECTION[action], nn_viz, player_direction

    # Fallback rule-based (nenhum modelo carregado)
    player_direction = None
    if aivai:
        player_state = {**state, "ai_y": state.get("player_y", 0.0)}
        player_direction = compute_direction(player_state)
    return compute_direction(state), None, player_direction


async def handle_state(
    message: aio_pika.IncomingMessage, channel: aio_pika.abc.AbstractChannel
) -> None:
    async with message.process():
        state = json.loads(message.body)
        direction, nn_viz, player_direction = _compute_direction(state)

        msg: dict = {"room_id": state["room_id"], "direction": direction}
        if nn_viz is not None:
            msg["nn_viz"] = nn_viz
        if player_direction is not None:
            msg["player_direction"] = player_direction
        payload = json.dumps(msg).encode()
        await channel.default_exchange.publish(
            aio_pika.Message(body=payload),
            routing_key=ACTION_QUEUE,
        )


async def _heartbeat() -> None:
    """Toca o arquivo de heartbeat enquanto o event loop estiver vivo.
    O healthcheck do container confere a idade do arquivo.
    """
    while True:
        HEARTBEAT_FILE.touch()
        await asyncio.sleep(HEARTBEAT_INTERVAL_S)


async def main() -> None:
    _load_agents()

    logger.info("Connecting to RabbitMQ at %s", RABBITMQ_URL)
    connection = await aio_pika.connect_robust(RABBITMQ_URL)

    async with connection:
        channel = await connection.channel()
        await channel.set_qos(prefetch_count=1)

        await channel.declare_queue(
            STATE_QUEUE, durable=True, arguments={"x-message-ttl": 50}
        )
        await channel.declare_queue(
            ACTION_QUEUE, durable=True, arguments={"x-message-ttl": 200}
        )

        state_queue = await channel.get_queue(STATE_QUEUE)

        loaded = ", ".join(_agents) if _agents else "rule-based"
        logger.info("AI service ready [%s] — consuming from '%s'", loaded, STATE_QUEUE)
        await state_queue.consume(lambda msg: handle_state(msg, channel))

        heartbeat_task = asyncio.create_task(_heartbeat())
        try:
            await asyncio.Future()
        finally:
            heartbeat_task.cancel()


if __name__ == "__main__":
    asyncio.run(main())
