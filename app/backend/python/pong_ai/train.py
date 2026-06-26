import logging
from pathlib import Path

import numpy as np
from gymnasium.vector import SyncVectorEnv

from pong_ai.dqn import DQNAgent
from pong_ai.env import PongEnv

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

MODELS_DIR = Path(__file__).parent / "models"
MODEL_PATH = MODELS_DIR / "dqn.pt"

NUM_ENVS = 4
TOTAL_STEPS = 200_000
LOG_EVERY = 20_000


def train(resume: bool = True) -> None:
    MODELS_DIR.mkdir(exist_ok=True)
    envs = SyncVectorEnv([lambda: PongEnv()] * NUM_ENVS)
    agent = DQNAgent()

    if resume and MODEL_PATH.exists():
        agent.load(str(MODEL_PATH))
        logger.info("Resuming from %s", MODEL_PATH)
    else:
        logger.info("Starting fresh training")

    logger.info("Training on %s | %d envs | %d total steps", agent.device, NUM_ENVS, TOTAL_STEPS)

    states, _ = envs.reset()
    episode_rewards = np.zeros(NUM_ENVS)
    completed: list[float] = []

    iterations = TOTAL_STEPS // NUM_ENVS
    for i in range(iterations):
        actions = agent.select_actions_batch(states)
        next_states, rewards, terminated, truncated, _ = envs.step(actions)
        dones = terminated | truncated

        for k in range(NUM_ENVS):
            agent.buffer.push(states[k], actions[k], float(rewards[k]), next_states[k], float(dones[k]))
            episode_rewards[k] += rewards[k]
            if dones[k]:
                completed.append(episode_rewards[k])
                episode_rewards[k] = 0.0

        agent.train_step()
        states = next_states

        real_steps = (i + 1) * NUM_ENVS
        if real_steps % LOG_EVERY == 0:
            recent = completed[-50:] if completed else [0.0]
            avg = sum(recent) / len(recent)
            logger.info(
                "steps %d/%d | avg_reward=%.3f | epsilon=%.3f | buffer=%d | episodes=%d",
                real_steps, TOTAL_STEPS, avg, agent.epsilon, len(agent.buffer), len(completed),
            )

    envs.close()
    agent.save(str(MODEL_PATH))
    logger.info("Model saved → %s", MODEL_PATH)


if __name__ == "__main__":
    train()
