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

// ── diagrama do colapso: a rede trava numa saída só ───────────────────────────
// três barras (subir / descer / parar); uma cravada no máximo, as outras mortas —
// é o que "colapsar numa ação só" quer dizer, legível num segundo.
const COLLAPSE_BARS = [
    { label: '↑ subir',  value: 1.0,  dead: false },
    { label: '↓ descer', value: 0.04, dead: true  },
    { label: '· parar',  value: 0.02, dead: true  },
];

function CollapseDiagram() {
    const W = 320, BAR_H = 26, GAP = 18, PAD_L = 68, TRACK = 180, TOP = 20;
    const H = TOP + COLLAPSE_BARS.length * (BAR_H + GAP);
    return (
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="block"
             style={{ background: '#080808', border: '1px solid rgba(255,255,255,0.08)' }}>
            {COLLAPSE_BARS.map((b, i) => {
                const y = TOP + i * (BAR_H + GAP);
                const w = Math.max(TRACK * b.value, 3);
                const fill = b.dead ? 'rgba(255,255,255,0.12)' : '#ff2d78';
                return (
                    <g key={b.label}>
                        <text x={PAD_L - 10} y={y + BAR_H / 2 + 3} textAnchor="end"
                              fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace">{b.label}</text>
                        <rect x={PAD_L} y={y} width={TRACK} height={BAR_H} fill="rgba(255,255,255,0.04)" />
                        <rect x={PAD_L} y={y} width={w} height={BAR_H} fill={fill}
                              opacity={b.dead ? 1 : 0.85} />
                    </g>
                );
            })}
        </svg>
    );
}

// ── diagrama da arquitetura: Browser ↔ Elixir ↔ Python ────────────────────────
// o loop da arena ao vivo — cada caixa é um serviço, cada seta um fluxo.
const ARCH_BOXES = [
    { x: 12,  label: 'BROWSER', sub: 'canvas + teclado', color: '#00f0ff' },
    { x: 214, label: 'ELIXIR',  sub: 'física · 60 fps',  color: '#ffffff' },
    { x: 416, label: 'PYTHON',  sub: 'rede neural',       color: '#ff2d78' },
];

function ArchDiagram() {
    const BW = 132, BH = 60, BY = 60;
    return (
        <svg viewBox="0 0 560 160" width="100%" className="block"
             style={{ background: '#080808', border: '1px solid rgba(255,255,255,0.08)' }}>
            <defs>
                <marker id="arch-arr" viewBox="0 0 10 10" refX="8" refY="5"
                        markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M0,0 L10,5 L0,10 z" fill="rgba(255,255,255,0.4)" />
                </marker>
            </defs>

            {/* browser ↔ elixir */}
            <g fontFamily="monospace" fontSize="8" fill="rgba(255,255,255,0.4)">
                <line x1={144} y1={78}  x2={214} y2={78}  stroke="rgba(255,255,255,0.22)" markerEnd="url(#arch-arr)" />
                <line x1={214} y1={102} x2={144} y2={102} stroke="rgba(255,255,255,0.22)" markerEnd="url(#arch-arr)" />
                <text x={179} y={42}  textAnchor="middle" fill="#00f0ff" opacity="0.7">WebSocket</text>
                <text x={179} y={74}  textAnchor="middle">teclas</text>
                <text x={179} y={116} textAnchor="middle">game_state</text>
            </g>

            {/* elixir ↔ python */}
            <g fontFamily="monospace" fontSize="8" fill="rgba(255,255,255,0.4)">
                <line x1={346} y1={78}  x2={416} y2={78}  stroke="rgba(255,255,255,0.22)" markerEnd="url(#arch-arr)" />
                <line x1={416} y1={102} x2={346} y2={102} stroke="rgba(255,255,255,0.22)" markerEnd="url(#arch-arr)" />
                <text x={381} y={42}  textAnchor="middle" fill="#ff2d78" opacity="0.7">RabbitMQ</text>
                <text x={381} y={74}  textAnchor="middle">estado</text>
                <text x={381} y={116} textAnchor="middle">ação</text>
            </g>

            {/* serviços */}
            {ARCH_BOXES.map((b) => (
                <g key={b.label}>
                    <rect x={b.x} y={BY} width={BW} height={BH} fill="rgba(255,255,255,0.03)"
                          stroke={b.color} strokeOpacity="0.4" />
                    <text x={b.x + BW / 2} y={BY + 26} textAnchor="middle"
                          fill={b.color} fontSize="13" fontFamily="monospace" fontWeight="bold">{b.label}</text>
                    <text x={b.x + BW / 2} y={BY + 44} textAnchor="middle"
                          fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="monospace">{b.sub}</text>
                </g>
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

const PPO_CODE = `# treino PPO — um agente que se corrige a cada jogada
for jogada in partida:
    acao     = politica(estado)             # o "ator" decide
    vantagem = retorno - critico(estado)    # o "crítico" julga

    # passo curto: anda na direção da vantagem, mas
    # sem mudar demais de uma vez (o "proximal" do PPO)
    razao = nova_prob(acao) / prob_antiga(acao)
    ganho = min(razao * vantagem,
                clip(razao, 0.8, 1.2) * vantagem)
    ajusta_pesos(para_maximizar=ganho)`;

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
        {
            title: t('pong.devlog_beat2_title'),
            body: t('pong.devlog_beat2_body'),
            visual: <CollapseDiagram />,
        },
        {
            title: t('pong.devlog_beat3_title'),
            body: t('pong.devlog_beat3_body'),
            visual: <CodeBlock file="train_ga.py">{GA_CODE}</CodeBlock>,
        },
        { title: t('pong.devlog_beat4_title'), body: t('pong.devlog_beat4_body') },
        {
            title: t('pong.devlog_beat5_title'),
            body: t('pong.devlog_beat5_body'),
            visual: <CodeBlock file="train_ppo.py">{PPO_CODE}</CodeBlock>,
        },
        {
            title: t('pong.devlog_beat6_title'),
            body: t('pong.devlog_beat6_body'),
            visual: <ArchDiagram />,
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
