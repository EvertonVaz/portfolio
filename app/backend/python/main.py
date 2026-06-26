import asyncio
import json
import logging
import os

import aio_pika
from pong_ai.rule_based import compute_direction

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost/")
STATE_QUEUE = "game.state"
ACTION_QUEUE = "game.ai_action"


async def handle_state(message: aio_pika.IncomingMessage, channel: aio_pika.abc.AbstractChannel) -> None:
    async with message.process():
        state = json.loads(message.body)
        direction = compute_direction(state)

        payload = json.dumps({"room_id": state["room_id"], "direction": direction}).encode()
        await channel.default_exchange.publish(
            aio_pika.Message(body=payload),
            routing_key=ACTION_QUEUE,
        )


async def main() -> None:
    logger.info("Connecting to RabbitMQ at %s", RABBITMQ_URL)
    connection = await aio_pika.connect_robust(RABBITMQ_URL)

    async with connection:
        channel = await connection.channel()
        await channel.set_qos(prefetch_count=10)

        await channel.declare_queue(STATE_QUEUE, durable=True)
        await channel.declare_queue(ACTION_QUEUE, durable=True)

        state_queue = await channel.get_queue(STATE_QUEUE)

        logger.info("AI service ready — consuming from '%s'", STATE_QUEUE)
        await state_queue.consume(lambda msg: handle_state(msg, channel))

        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())
