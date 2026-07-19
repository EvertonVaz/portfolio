import { useCallback, useEffect, useRef, useState } from 'react';

const GW       = Number(import.meta.env.VITE_GAME_WIDTH    ?? 800);
const GH       = Number(import.meta.env.VITE_GAME_HEIGHT   ?? 600);
const PADDLE_W = Number(import.meta.env.VITE_PADDLE_WIDTH  ?? 12);
const PADDLE_H = Number(import.meta.env.VITE_PADDLE_HEIGHT ?? 80);
const BALL_R   = Number(import.meta.env.VITE_BALL_RADIUS   ?? 8);
const PLAYER_X = Number(import.meta.env.VITE_PLAYER_X      ?? 20);
const AI_X     = Number(import.meta.env.VITE_AI_X          ?? 768);

const API          = '/train-api';
const POLL         = 110;  // ms, com o servidor de treino respondendo
const POLL_OFFLINE = 5000; // ms, backoff quando o servidor está fora

// ── gráfico de comportamento ──────────────────────────────────────────────────
// Tendência das métricas do log ao longo das gerações. Escalas diferentes são
// normalizadas pra um eixo 0-100%; a legenda mostra o valor real de cada série.

const clamp01 = v => Math.max(0, Math.min(1, v));

// win% tem teto real (0-100); hits/pt e return não têm máximo fixo (crescem com o
// rally), então auto-escalam pelo maior valor da janela — nada gruda no topo.
const SERIES = [
    { key: 'win%',    color: '#00f0ff', value: h => h.win ?? 0,    fmt: v => `${Math.round(v)}%`, fixed: [0, 100] },
    { key: 'hits/pt', color: '#ff2d78', value: h => h.hits ?? 0,   fmt: v => v.toFixed(2) },
    { key: 'return',  color: '#ffd23f', value: h => h.return ?? 0, fmt: v => v.toFixed(2) },
];

// Resolve [lo, hi] de cada série e devolve a fn de normalização pra [0,1].
// fixed → teto real; auto → [min(0, ·), max] sobre a janela do gráfico.
function scaleSeries(history) {
    return SERIES.map(s => {
        let lo, hi;
        if (s.fixed) {
            [lo, hi] = s.fixed;
        } else {
            const vals = history.map(s.value);
            lo = Math.min(0, ...vals);
            hi = Math.max(...vals);
            if (hi <= lo) hi = lo + 1;  // evita divisão por zero
        }
        return { ...s, norm: h => clamp01((s.value(h) - lo) / (hi - lo)) };
    });
}

const ACT_COLORS = ['#00f0ff', '#ff2d78', 'rgba(255,255,255,0.25)'];  // ↑ ↓ ·

function BehaviorChart({ history, unit = 'gen' }) {
    const W = 560, H = 180, PX = 40, PY = 16;

    if (!history.length) {
        return (
            <div className="w-full flex items-center justify-center border border-white/10"
                 style={{ background: '#080808', height: H }}>
                <span className="font-mono text-xs text-white/20 uppercase tracking-widest">
                    aguardando dados…
                </span>
            </div>
        );
    }

    const n = history.length;
    const cx = i => PX + (i / Math.max(n - 1, 1)) * (W - PX - 8);
    const cy = v => PY + (1 - v) * (H - 2 * PY);   // v ∈ [0,1]

    const linePath = norm =>
        history.map((h, i) => `${i === 0 ? 'M' : 'L'}${cx(i).toFixed(1)},${cy(norm(h)).toFixed(1)}`).join(' ');

    const last = history[n - 1];
    const series = scaleSeries(history);
    const grid = [{ v: 1, label: '100%' }, { v: 0.5, label: '50' }, { v: 0, label: '0' }];
    const act = last.act ?? [0, 0, 0];

    return (
        <div className="w-full flex flex-col gap-2">
            {/* Legenda com valores reais */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px]">
                {series.map(s => (
                    <span key={s.key} className="flex items-center gap-1.5" style={{ color: s.color }}>
                        <span className="inline-block w-3 h-[2px]" style={{ background: s.color }} />
                        {s.key} <span className="tabular-nums">{s.fmt(s.value(last))}</span>
                    </span>
                ))}
            </div>

            <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="w-full block"
                 style={{ background: '#080808', border: '1px solid rgba(255,255,255,0.08)' }}>
                {/* Grade horizontal (0 / 50 / 100%) */}
                {grid.map(({ v, label }) => (
                    <g key={v}>
                        <line x1={PX} y1={cy(v)} x2={W - 8} y2={cy(v)}
                              stroke="rgba(255,255,255,0.06)" strokeDasharray="4,6" />
                        <text x={PX - 4} y={cy(v) + 4} textAnchor="end"
                              fill="rgba(255,255,255,0.25)" fontSize={9} fontFamily="monospace">
                            {label}
                        </text>
                    </g>
                ))}

                {/* Eixos */}
                <line x1={PX} y1={PY} x2={PX} y2={H - PY} stroke="rgba(255,255,255,0.12)" />
                <line x1={PX} y1={H - PY} x2={W - 8} y2={H - PY} stroke="rgba(255,255,255,0.12)" />

                {/* Labels eixo X */}
                <text x={PX} y={H - 4} fill="rgba(255,255,255,0.2)" fontSize={9} fontFamily="monospace">
                    {unit} {history[0].gen}
                </text>
                <text x={W - 8} y={H - 4} textAnchor="end"
                      fill="rgba(255,255,255,0.2)" fontSize={9} fontFamily="monospace">
                    {unit} {last.gen}
                </text>

                {/* Linhas + ponto atual de cada série */}
                {series.map(s => (
                    <g key={s.key}>
                        {n > 1 && (
                            <path d={linePath(s.norm)} fill="none" stroke={s.color}
                                  strokeWidth={2} opacity={0.9} />
                        )}
                        <circle cx={cx(n - 1)} cy={cy(s.norm(last))} r={3} fill={s.color} />
                    </g>
                ))}
            </svg>

            {/* act[↑↓·] barra empilhada + extras ao vivo */}
            <div className="flex items-center gap-3 font-mono text-[10px] text-white/40">
                <span className="uppercase tracking-widest text-white/30 shrink-0">act ↑↓·</span>
                <div className="flex h-2 flex-1 min-w-0 overflow-hidden border border-white/10">
                    {act.map((p, i) => (
                        <div key={i} style={{ width: `${p}%`, background: ACT_COLORS[i] }} />
                    ))}
                </div>
                <span className="text-white/50 tabular-nums shrink-0">{act[0]}/{act[1]}/{act[2]}</span>
                {last.pop_std != null && <span className="shrink-0">pop_std {last.pop_std.toFixed(2)}</span>}
                {last.pts_len != null && <span className="shrink-0">pts_len {Math.round(last.pts_len)}</span>}
                {last.best_fit != null && <span className="shrink-0">best_fit {last.best_fit.toFixed(2)}</span>}
            </div>
        </div>
    );
}

// ── canvas da partida ─────────────────────────────────────────────────────────

function drawGame(ctx, { ball, player, ai }) {
    ctx.clearRect(0, 0, GW, GH);
    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, GW, GH);

    ctx.setLineDash([8, 12]);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(GW / 2, 0); ctx.lineTo(GW / 2, GH); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.font = 'bold 44px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(player.score, GW / 4, 60);
    ctx.fillText(ai.score, (GW * 3) / 4, 60);

    // Oponente — cyan
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 6;
    ctx.fillRect(PLAYER_X, player.y, PADDLE_W, PADDLE_H);

    // IA — pink
    ctx.fillStyle = '#ff2d78';
    ctx.shadowColor = '#ff2d78'; ctx.shadowBlur = 6;
    ctx.fillRect(AI_X, ai.y, PADDLE_W, PADDLE_H);

    // Bola
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
}

// ── componente principal ──────────────────────────────────────────────────────

const ALGOS = ['ga', 'ppo'];

export function TrainingPanel() {
    const canvasRef    = useRef(null);
    const [info, setInfo]           = useState({ running: false, algo: 'ga', generation: 0, total: 300 });
    const [histories, setHistories] = useState({ ga: [], ppo: [] });
    const [algo, setAlgo]           = useState('ga');
    const [offline, setOffline]     = useState(false);

    const poll = useCallback(async () => {
        try {
            const res = await fetch(`${API}/status`, { signal: AbortSignal.timeout(900) });
            if (!res.ok) throw new Error();
            const data = await res.json();

            setOffline(false);
            setInfo({ running: data.running, algo: data.algo, generation: data.generation, total: data.total });
            if (data.histories) setHistories(data.histories);
            // enquanto treina, trava a visão no algoritmo em execução
            if (data.running) setAlgo(data.algo);

            if (data.game && canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                drawGame(ctx, data.game);
            }
            return true;
        } catch {
            setOffline(true);
            return false;
        }
    }, []);

    useEffect(() => {
        let timer;
        let cancelled = false;
        const loop = async () => {
            const online = await poll();
            if (cancelled) return;
            timer = setTimeout(loop, online ? POLL : POLL_OFFLINE);
        };
        loop();
        return () => { cancelled = true; clearTimeout(timer); };
    }, [poll]);

    const toggle = async () => {
        const path = info.running ? '/stop' : '/start';
        try {
            await fetch(`${API}${path}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ algo }),
            });
        } catch { /* server offline */ }
    };

    const downloadModel = () => {
        const a = document.createElement('a');
        a.href = `${API}/model/${algo}`;
        a.download = `${algo}.pt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    const pct = info.total > 0 ? Math.round((info.generation / info.total) * 100) : 0;

    const history    = histories[algo] ?? [];
    const lastRecord = history.at(-1);
    const isPpo      = algo === 'ppo';
    const unit       = isPpo ? 'step' : 'gen';
    const fmt        = (n) => (isPpo && n >= 1000 ? `${(n / 1000).toFixed(0)}k` : n);

    return (
        <div className="w-full flex flex-col gap-6">

            {/* ── cabeçalho ────────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h3 className="font-mono text-sm uppercase tracking-widest text-white/50">
                        {isPpo ? 'Proximal Policy Optimization' : 'Genetic Algorithm'} — Training Monitor
                    </h3>
                    <div className="flex items-center gap-4">
                        {lastRecord && (
                            <>
                                <span className="font-mono text-xs text-punk-cyan/60">
                                    win: {Math.round(lastRecord.win ?? 0)}%
                                </span>
                                <span className="font-mono text-xs text-punk-cyan/40">
                                    hits/pt: {(lastRecord.hits ?? 0).toFixed(2)}
                                </span>
                                <span className="font-mono text-xs text-punk-cyan/30">
                                    return: {(lastRecord.return ?? 0).toFixed(2)}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Seletor de algoritmo */}
                    <div className="flex border border-white/10">
                        {ALGOS.map((a) => (
                            <button
                                key={a}
                                onClick={() => setAlgo(a)}
                                disabled={info.running}
                                className={`font-mono text-xs uppercase tracking-widest px-3 py-1 transition-colors disabled:cursor-not-allowed ${
                                    algo === a
                                        ? 'bg-punk-cyan/10 text-punk-cyan'
                                        : 'text-white/30 hover:text-white/60 disabled:opacity-40'
                                }`}
                            >
                                {a}
                            </button>
                        ))}
                    </div>

                    {/* Status */}
                    <div className={`flex items-center gap-2 font-mono text-xs border px-3 py-1 ${
                        offline
                            ? 'border-red-500/20 text-red-400'
                            : info.running
                            ? 'border-punk-cyan/20 text-punk-cyan'
                            : 'border-white/10 text-white/30'
                    }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                            offline ? 'bg-red-500' : info.running ? 'bg-punk-cyan animate-pulse' : 'bg-white/20'
                        }`} />
                        {offline ? 'OFFLINE' : info.running ? 'TREINANDO' : 'PARADO'}
                    </div>

                    {/* Progresso */}
                    {!offline && (
                        <span className="font-mono text-xs text-white/25">
                            {fmt(info.generation)} / {fmt(info.total)} {unit}
                        </span>
                    )}

                    {/* Download do checkpoint servido */}
                    <button
                        onClick={downloadModel}
                        disabled={offline}
                        title={`baixar ${algo}.pt do servidor`}
                        className="font-mono text-xs uppercase tracking-widest px-4 py-2 border border-white/20 text-white/50 hover:text-white/80 hover:border-white/40 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                    >
                        ↓ {algo}.pt
                    </button>

                    {/* Botão */}
                    <button
                        onClick={toggle}
                        disabled={offline}
                        className={`font-mono text-xs uppercase tracking-widest px-5 py-2 border transition-colors disabled:opacity-25 disabled:cursor-not-allowed ${
                            info.running
                                ? 'border-punk-pink/50 text-punk-pink hover:bg-punk-pink/10'
                                : 'border-punk-cyan/50 text-punk-cyan hover:bg-punk-cyan/10'
                        }`}
                    >
                        {info.running ? '■ parar' : '▶ treinar'}
                    </button>
                </div>
            </div>

            {/* ── barra de progresso ────────────────────────────────────────── */}
            {!offline && (
                <div className="w-full h-px bg-white/5 relative overflow-visible">
                    <div
                        className="absolute top-0 left-0 h-px bg-punk-cyan/40 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                    />
                </div>
            )}

            {/* ── gráfico + partida ─────────────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">

                {/* Gráfico */}
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <p className="font-mono text-xs text-white/25 uppercase tracking-widest">
                        Comportamento por {isPpo ? 'Rollout' : 'Geração'}
                        <span className="text-white/15 ml-2">— métricas do log, normalizadas 0-100%</span>
                    </p>
                    <BehaviorChart history={history} unit={unit} />
                </div>

                {/* Partida ao vivo */}
                <div className="flex flex-col gap-2 flex-none">
                    <p className="font-mono text-xs text-white/25 uppercase tracking-widest">
                        Partida ao Vivo — GA vs PPO
                    </p>
                    <div className="relative">
                        <canvas
                            ref={canvasRef}
                            width={GW}
                            height={GH}
                            className="border border-white/10 block"
                            style={{ width: '340px', height: 'auto', background: '#080808' }}
                        />
                        {offline && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                                <span className="font-mono text-xs text-red-400 uppercase tracking-widest">
                                    servidor offline
                                </span>
                            </div>
                        )}
                        {!offline && !info.running && history.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                <span className="font-mono text-xs text-white/30 uppercase tracking-widest">
                                    pressione ▶ treinar
                                </span>
                            </div>
                        )}
                    </div>
                    {/* Labels */}
                    <div className="flex justify-between font-mono text-xs">
                        <span className="text-punk-cyan/50">← PPO</span>
                        <span className="text-punk-pink/50">GA →</span>
                    </div>
                </div>
            </div>

            {/* ── nota sobre servidor ──────────────────────────────────────── */}
            {offline && (
                <p className="font-mono text-xs text-white/20 text-center">
                    inicie o servidor de treino: <code className="text-white/40">make train-server</code>
                </p>
            )}
        </div>
    );
}
