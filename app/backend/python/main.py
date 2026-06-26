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
MODEL_PATH = Path(__file__).parent / "pong_ai" / "models" / "dqn.pt"

# Constantes espelhadas do PongEnv — lidas do ambiente para manter sincronismo
_W             = float(os.getenv("GAME_WIDTH",    "800"))
_H             = float(os.getenv("GAME_HEIGHT",   "600"))
_PADDLE_H      = float(os.getenv("PADDLE_HEIGHT", "80"))
_MAX_BALL_SPEED = float(os.getenv("MAX_BALL_SPEED", "10.0"))

_agent = None


def _load_agent():
    global _agent
    if not MODEL_PATH.exists():
        logger.warning("Model not found at %s — using rule-based AI", MODEL_PATH)
        return

    try:
        from pong_ai.dqn import DQNAgent
        _agent = DQNAgent()
        _agent.load(str(MODEL_PATH))
        logger.info("DQN model loaded from %s", MODEL_PATH)
    except Exception as exc:
        logger.error("Failed to load DQN model: %s — falling back to rule-based", exc)
        _agent = None


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


_ACTION_TO_DIRECTION = {0: "up", 1: "down", 2: "stop"}
_NN_VIZ_BINS = 16


def _bin(values: list[float], n: int) -> list[float]:
    size = len(values) // n
    return [float(np.mean(values[i * size:(i + 1) * size])) for i in range(n)]


def _compute_direction(state: dict) -> tuple[str, dict | None]:
    if _agent is not None:
        obs = _state_to_obs(state)
        action, raw = _agent.predict_with_activations(obs)
        nn_viz = {
            "layers": [6, _NN_VIZ_BINS, _NN_VIZ_BINS, 3],
            "activations": [
                raw[0],
                _bin(raw[1], _NN_VIZ_BINS),
                _bin(raw[2], _NN_VIZ_BINS),
                raw[3],
            ],
        }
        return _ACTION_TO_DIRECTION[action], nn_viz
    return compute_direction(state), None


async def handle_state(
    message: aio_pika.IncomingMessage, channel: aio_pika.abc.AbstractChannel
) -> None:
    async with message.process():
        state = json.loads(message.body)
        direction, nn_viz = _compute_direction(state)

        msg: dict = {"room_id": state["room_id"], "direction": direction}
        if nn_viz is not None:
            msg["nn_viz"] = nn_viz
        payload = json.dumps(msg).encode()
        await channel.default_exchange.publish(
            aio_pika.Message(body=payload),
            routing_key=ACTION_QUEUE,
        )


async def main() -> None:
    _load_agent()

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

        mode = "DQN" if _agent is not None else "rule-based"
        logger.info("AI service ready [%s] — consuming from '%s'", mode, STATE_QUEUE)
        await state_queue.consume(lambda msg: handle_state(msg, channel))

        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())
