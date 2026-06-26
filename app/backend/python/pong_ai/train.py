import logging
from pathlib import Path

from pong_ai.dqn import DQNAgent
from pong_ai.env import PongEnv

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

MODELS_DIR = Path(__file__).parent / "models"
MODEL_PATH = MODELS_DIR / "dqn.pt"
EPISODES = 5_000
LOG_EVERY = 200


def train() -> None:
    MODELS_DIR.mkdir(exist_ok=True)
    env = PongEnv()
    agent = DQNAgent()

    logger.info("Training on %s", agent.device)
    recent_rewards: list[float] = []

    for episode in range(1, EPISODES + 1):
        state, _ = env.reset()
        total_reward = 0.0
        done = False

        while not done:
            action = agent.select_action(state)
            next_state, reward, terminated, truncated, _ = env.step(action)
            done = terminated or truncated

            agent.buffer.push(state, action, reward, next_state, float(done))
            agent.train_step()

            state = next_state
            total_reward += reward

        recent_rewards.append(total_reward)

        if episode % LOG_EVERY == 0:
            avg = sum(recent_rewards[-LOG_EVERY:]) / LOG_EVERY
            logger.info(
                "ep %d/%d | avg_reward=%.3f | epsilon=%.3f | buffer=%d",
                episode, EPISODES, avg, agent.epsilon, len(agent.buffer),
            )

    agent.save(str(MODEL_PATH))
    logger.info("Model saved → %s", MODEL_PATH)


if __name__ == "__main__":
    train()
