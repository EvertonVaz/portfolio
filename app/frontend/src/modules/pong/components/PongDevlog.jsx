import React from 'react';
import { useTranslation } from 'react-i18next';
import Devlog from '../../../shared/ui/Devlog/Devlog';
import CodeBlock from '../../../shared/ui/Devlog/CodeBlock';

// ── diagrama da rede 6 → 16 → 16 → 3 (específico do pong) ──────────────────────
const LAYERS = [
    { x: 70,  ys: [24, 56, 88, 120, 152, 184], color: '#00f0ff', count: '6' },
    { x: 210, ys: [40, 72, 104, 136, 168],      color: '#ffffff', count: '16' },
    { x: 350, ys: [40, 72, 104, 136, 168],      color: '#ffffff', count: '16' },
    { x: 470, ys: [72, 104, 136],               color: '#ff2d78', count: '3' },
];
const IN_LABELS  = ['ball x', 'ball y', 'vel x', 'vel y', 'ai_y', 'player_y'];
const OUT_LABELS = ['↑ cima', '↓ baixo', '· parado'];

function NetworkDiagram() {
    return (
        <svg viewBox="0 0 540 210" width="100%" className="block"
             style={{ background: '#080808', border: '1px solid rgba(255,255,255,0.08)' }}>
            {/* conexões */}
            {LAYERS.slice(0, -1).map((col, ci) => (
                <g key={ci} stroke="rgba(255,255,255,0.07)" strokeWidth="1">
                    {col.ys.map((y1, i) =>
                        LAYERS[ci + 1].ys.map((y2, j) => (
                            <line key={`${i}-${j}`} x1={col.x} y1={y1} x2={LAYERS[ci + 1].x} y2={y2} />
                        ))
                    )}
                </g>
            ))}

            {/* labels das entradas */}
            {IN_LABELS.map((l, i) => (
                <text key={l} x={LAYERS[0].x - 12} y={LAYERS[0].ys[i] + 3} textAnchor="end"
                      fill="rgba(255,255,255,0.35)" fontSize="8" fontFamily="monospace">{l}</text>
            ))}

            {/* nós */}
            {LAYERS.map((col, ci) => (
                <g key={ci}>
                    {col.ys.map((y, i) => (
                        <circle key={i} cx={col.x} cy={y} r="5" fill={col.color}
                                opacity={ci === 0 || ci === LAYERS.length - 1 ? 0.9 : 0.5} />
                    ))}
                    <text x={col.x} y="206" textAnchor="middle"
                          fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="monospace">{col.count}</text>
                </g>
            ))}

            {/* labels das saídas */}
            {OUT_LABELS.map((l, i) => (
                <text key={l} x={LAYERS[3].x + 14} y={LAYERS[3].ys[i] + 3} textAnchor="start"
                      fill="rgba(255,45,120,0.8)" fontSize="9" fontFamily="monospace">{l}</text>
            ))}
        </svg>
    );
}

// ── código real (ilustrativo, não traduzido) ──────────────────────────────────
const NET_CODE = `class QNetwork(nn.Module):        # 6 → 16 → 16 → 3
    def __init__(self):
        self.net = nn.Sequential(
            nn.Linear(6, 16),  nn.ReLU(),
            nn.Linear(16, 16), nn.ReLU(),
            nn.Linear(16, 3),          # sobe / desce / para
        )`;

const GA_CODE = `def next_generation(genomes, fitness):
    # seleção natural: os 30% melhores viram pais
    parents = select_parents(genomes, fitness, 0.30)

    # elitismo: os 2 campeões passam intactos
    new_pop = elites(genomes, fitness, n=2)

    # o resto nasce de cruzamento + mutação
    while len(new_pop) < POP_SIZE:
        child = crossover(pick(parents), pick(parents))
        child = mutate(child)
        new_pop.append(child)
    return new_pop`;

const PIPE_CODE = `# main.py — para cada estado publicado pelo Elixir
async def handle_state(msg):
    state  = json.loads(msg.body)
    obs    = state_to_obs(state)     # 6 números normalizados
    action = agent.predict(obs)      # argmax da rede → 0/1/2
    publish(DIRECTION[action])       # volta ao Elixir via RabbitMQ`;

export default function PongDevlog() {
    const { t } = useTranslation();

    const beats = [
        {
            title: t('pong.devlog_beat1_title'),
            body: t('pong.devlog_beat1_body'),
            visual: (
                <div className="flex flex-col gap-4">
                    <NetworkDiagram />
                    <CodeBlock file="net.py">{NET_CODE}</CodeBlock>
                </div>
            ),
        },
        { title: t('pong.devlog_beat2_title'), body: t('pong.devlog_beat2_body') },
        {
            title: t('pong.devlog_beat3_title'),
            body: t('pong.devlog_beat3_body'),
            visual: <CodeBlock file="train_ga.py">{GA_CODE}</CodeBlock>,
        },
        { title: t('pong.devlog_beat4_title'), body: t('pong.devlog_beat4_body') },
        {
            title: t('pong.devlog_beat5_title'),
            body: t('pong.devlog_beat5_body'),
            visual: <CodeBlock file="main.py">{PIPE_CODE}</CodeBlock>,
        },
    ];

    return (
        <Devlog
            theme="pong"
            kicker={t('pong.devlog_kicker')}
            title={t('pong.devlog_title')}
            subtitle={t('pong.devlog_subtitle')}
            beats={beats}
        />
    );
}
