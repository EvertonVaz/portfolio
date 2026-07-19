"""Testes do motor evolutivo (train_ga), sem pytest no projeto.

Roda com:  uv run python -m pong_ai.test_ga

O teste central é de COMPORTAMENTO: o GA precisa de fato otimizar. Injeta uma
fitness sintética (esfera, ótimo em 0) e verifica que a evolução caminha até lá —
independente do Pong. Os demais checam as operações genéticas isoladas.
"""
import numpy as np

from pong_ai.train_ga import crossover, evolve, mutate, select_parents


def test_select_parents_returns_top_fraction():
    genomes = [np.array([i], dtype=np.float32) for i in range(10)]
    fitness = [float(i) for i in range(10)]  # o gene i tem fitness i
    parents = select_parents(genomes, fitness, elite_frac=0.3)
    vals = sorted(float(p[0]) for p in parents)
    assert vals == [7.0, 8.0, 9.0], vals  # exatamente os 3 melhores


def test_crossover_mixes_both_parents():
    rng = np.random.default_rng(0)
    a = np.zeros(200, dtype=np.float32)
    b = np.ones(200, dtype=np.float32)
    child = crossover(a, b, rng)
    genes = set(np.unique(child).tolist())
    assert genes.issubset({0.0, 1.0}), genes       # cada gene veio de um dos pais
    assert 0.0 in genes and 1.0 in genes           # herdou dos dois


def test_mutate_perturbs_a_fraction():
    rng = np.random.default_rng(0)
    g = np.zeros(2000, dtype=np.float32)
    m = mutate(g, rate=0.1, scale=1.0, rng=rng)
    changed = int(np.count_nonzero(m != g))
    assert m.shape == g.shape
    assert 120 < changed < 280, changed            # ~10% de 2000, com folga


def test_evolve_optimizes_sphere():
    """Fitness = -||g||²  (ótimo em g=0). O GA tem que empurrar até perto de 0."""
    rng = np.random.default_rng(0)
    size = 20
    pop = [rng.standard_normal(size).astype(np.float32) for _ in range(40)]

    def fitness_fn(genomes):
        return [-float(np.sum(g ** 2)) for g in genomes]

    best, best_fit = evolve(
        fitness_fn, pop, rng,
        generations=60, elite_frac=0.3, n_elite=2,
        mutation_rate=0.2, mutation_scale=0.2,
    )
    assert best_fit > -2.0, f"GA nao convergiu: best_fit={best_fit:.3f}"


def _run_all():
    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    for t in tests:
        t()
        print(f"ok  {t.__name__}")
    print(f"\n{len(tests)} passed")


if __name__ == "__main__":
    _run_all()
