"""
Treinamento via Algoritmo Genético (seleção natural clássica).

Diferente do OpenAI-ES (que estima gradiente perturbando pesos), aqui é evolução
darwiniana pura: uma população de genomas (os pesos da rede) joga Pong, os 30%
melhores viram pais, e a próxima geração HERDA seus atributos via crossover +
mutação. O elitismo carrega os melhores intactos, então o melhor nunca regride.

"Saber qual jogada foi boa": um GA sobre pesos não isola uma ação (isso é
gradiente, é PPO). Mas o reward do PongEnv já é denso — cada rebatida vale
+0.5..+1.0 e cada episódio é UM ponto —, então o fitness (retorno médio do ponto)
soma as boas jogadas daquele lance. A seleção natural favorece genomas que fazem
mais boas jogadas: é assim que a natureza credita comportamento, sem isolar um gesto.

O oponente é sempre a âncora rule-based (com handicap), igual ao eval do PPO.

Uso:
    python -m pong_ai.train_ga           # treina ou retoma do checkpoint ga.pt
    python -m pong_ai.train_ga --fresh   # ignora checkpoint existente
"""
import logging
import sys
from collections.abc import Callable
from multiprocessing import Pool, cpu_count
from pathlib import Path

import numpy as np
import torch

from pong_ai.net import QNetwork, RuleBasedNet
from pong_ai.train_common import ANCHOR_DEADBAND, EVAL_SEEDS, evaluate_in_env, format_log

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

MODELS_DIR = Path(__file__).parent / "models"
MODEL_PATH = MODELS_DIR / "ga.pt"

POP_SIZE          = 60
ELITE_FRAC        = 0.30    # os 30% melhores viram pais da próxima geração
N_ELITE           = 2       # nº de campeões carregados intactos (best nunca regride)
MUTATION_RATE     = 0.10    # fração dos genes de um filho que sofre mutação
MUTATION_SCALE    = 0.10    # desvio do ruído gaussiano da mutação
INIT_SCALE        = 0.50    # desvio dos pesos na população inicial
GENERATIONS       = 50
PHASE = 10 * 1
EPISODES_PER_EVAL = 10      # pontos por genoma na avaliação de fitness
EVAL_WORKERS      = min(POP_SIZE, cpu_count())
ANCHOR = float(ANCHOR_DEADBAND - PHASE)


# ── motor evolutivo (puro, testável com fitness sintética) ────────────────────

def select_parents(
    genomes: list[np.ndarray], fitness: list[float], elite_frac: float
) -> list[np.ndarray]:
    """Seleção natural: devolve o top `elite_frac` da população por fitness."""
    k = max(1, int(len(genomes) * elite_frac))
    top = np.argsort(fitness)[-k:]
    return [genomes[i] for i in top]


def crossover(a: np.ndarray, b: np.ndarray, rng: np.random.Generator) -> np.ndarray:
    """Crossover uniforme: cada gene do filho vem de um dos pais (50/50)."""
    mask = rng.random(a.shape) < 0.5
    return np.where(mask, a, b).astype(np.float32)


def mutate(
    genome: np.ndarray, rate: float, scale: float, rng: np.random.Generator
) -> np.ndarray:
    """Muta uma fração `rate` dos genes somando ruído N(0, scale)."""
    mask = rng.random(genome.shape) < rate
    noise = rng.standard_normal(genome.shape).astype(np.float32) * scale
    return (genome + mask * noise).astype(np.float32)


def next_generation(
    genomes: list[np.ndarray],
    fitness: list[float],
    rng: np.random.Generator,
    elite_frac: float,
    n_elite: int,
    mutation_rate: float,
    mutation_scale: float,
) -> list[np.ndarray]:
    """Monta a próxima geração: elitismo + filhos (crossover de pais + mutação)."""
    parents = select_parents(genomes, fitness, elite_frac)

    elite_idx = np.argsort(fitness)[-n_elite:]
    new_pop = [genomes[i].copy() for i in elite_idx]  # campeões intactos

    while len(new_pop) < len(genomes):
        pa = parents[rng.integers(len(parents))]
        pb = parents[rng.integers(len(parents))]
        child = crossover(pa, pb, rng)
        child = mutate(child, mutation_rate, mutation_scale, rng)
        new_pop.append(child)
    return new_pop


def evolve(
    fitness_fn: Callable[[list[np.ndarray]], list[float]],
    init_pop: list[np.ndarray],
    rng: np.random.Generator,
    generations: int,
    elite_frac: float,
    n_elite: int,
    mutation_rate: float,
    mutation_scale: float,
    on_gen: Callable[[int, list[np.ndarray], list[float]], None] | None = None,
) -> tuple[np.ndarray, float]:
    """Loop evolutivo. Avalia, reporta, gera a próxima; devolve o melhor genoma visto.

    fitness_fn recebe a população e devolve um fitness por genoma — assim o motor
    não conhece Pong e é testável com qualquer objetivo (ver test_ga.py).
    """
    pop = init_pop
    best_genome: np.ndarray | None = None
    best_fit = -np.inf
    for gen in range(generations):
        fitness = fitness_fn(pop)
        champ = int(np.argmax(fitness))
        if fitness[champ] > best_fit:
            best_fit, best_genome = fitness[champ], pop[champ].copy()
        if on_gen is not None:
            on_gen(gen, pop, fitness)
        pop = next_generation(
            pop, fitness, rng, elite_frac, n_elite, mutation_rate, mutation_scale
        )
    return best_genome, best_fit


# ── ponte com o Pong ──────────────────────────────────────────────────────────

def _genome_size() -> int:
    return sum(p.numel() for p in QNetwork().parameters())


def _build_net(genome: np.ndarray) -> QNetwork:
    net = QNetwork()
    idx = 0
    with torch.no_grad():
        for p in net.parameters():
            n = p.numel()
            p.data.copy_(
                torch.from_numpy(genome[idx: idx + n].reshape(p.shape).astype(np.float32))
            )
            idx += n
    net.eval()
    net.requires_grad_(False)
    return net


def _greedy_action(net: QNetwork) -> Callable[[np.ndarray], int]:
    def fn(obs: np.ndarray) -> int:
        with torch.no_grad():
            return int(net(torch.FloatTensor(obs).unsqueeze(0)).argmax(dim=1).item())
    return fn


def _evaluate_genome(args: tuple[np.ndarray, list[int]]) -> float:
    """Fitness = retorno médio por ponto vs âncora rule-based (reward já denso)."""
    genome, seeds = args
    net = _build_net(genome)
    m = evaluate_in_env(_greedy_action(net), RuleBasedNet(deadband=ANCHOR), seeds)
    return m["return"]


def _initial_population(
    rng: np.random.Generator, size: int, fresh: bool = False
) -> tuple[list[np.ndarray], int]:
    """População inicial: retoma de ga.pt se existir (campeão intacto + mutações
    dele), senão aleatória. Com fresh=True ignora o checkpoint e começa do zero.
    Devolve (pop, geração de partida)."""
    if not fresh and MODEL_PATH.exists():
        data = torch.load(MODEL_PATH, map_location="cpu", weights_only=True)
        champ = data["params"].numpy().astype(np.float32)
        start_gen = int(data.get("generation", 0))
        logger.info("Resuming GA ← %s (generation %d)", MODEL_PATH, start_gen)
        pop = [champ.copy()]
        pop += [mutate(champ, MUTATION_RATE, MUTATION_SCALE, rng)
                for _ in range(POP_SIZE - 1)]
        return pop, start_gen
    logger.info("Starting GA fresh")
    pop = [rng.standard_normal(size).astype(np.float32) * INIT_SCALE
           for _ in range(POP_SIZE)]
    return pop, 0


def train(fresh: bool = False) -> None:
    MODELS_DIR.mkdir(exist_ok=True)
    rng = np.random.default_rng()
    size = _genome_size()
    pop, start_gen = _initial_population(rng, size, fresh)
    target = start_gen + GENERATIONS

    logger.info(
        "GA training | pop=%d | anchor_deadband=%.0f | elite=%.0f%% (n_elite=%d) | mut rate=%.2f scale=%.2f | "
        "gen %d→%d | workers=%d",
        POP_SIZE, ANCHOR, 100 * ELITE_FRAC, N_ELITE, MUTATION_RATE, MUTATION_SCALE,
        start_gen, target, EVAL_WORKERS,
    )

    with Pool(processes=EVAL_WORKERS) as pool:
        def fitness_fn(genomes: list[np.ndarray]) -> list[float]:
            # Common random numbers dentro da geração (comparação justa), mas seeds
            # novas a cada geração forçam os genomas a generalizar, não decorar o sorteio.
            seeds = [int(rng.integers(0, 2**31 - 1)) for _ in range(EPISODES_PER_EVAL)]
            return pool.map(_evaluate_genome, [(g, seeds) for g in genomes])

        def on_gen(gen: int, genomes: list[np.ndarray], fitness: list[float]) -> None:
            if gen % 10 != 0:
                return
            champ = genomes[int(np.argmax(fitness))]
            m = evaluate_in_env(
                _greedy_action(_build_net(champ)),
                RuleBasedNet(deadband=ANCHOR_DEADBAND), EVAL_SEEDS,
            )
            extra = (
                f" | best_fit={max(fitness):.2f} | "
                f"pop_std={float(np.std(fitness)):.2f}"
            )
            g = start_gen + gen
            logger.info(format_log("gen", g, target, m, extra))
            torch.save({"params": torch.from_numpy(champ), "generation": g}, MODEL_PATH)

        best, best_fit = evolve(
            fitness_fn, pop, rng, GENERATIONS,
            ELITE_FRAC, N_ELITE, MUTATION_RATE, MUTATION_SCALE, on_gen,
        )


    torch.save({"params": torch.from_numpy(best), "generation": target}, MODEL_PATH)
    logger.info("Training complete → %s (best_fit=%.2f)", MODEL_PATH, best_fit)


if __name__ == "__main__":
    train(fresh="--fresh" in sys.argv)
