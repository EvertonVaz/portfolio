import { useCallback, useEffect, useRef, useState } from 'react';

const GW       = Number(import.meta.env.VITE_GAME_WIDTH    ?? 800);
const GH       = Number(import.meta.env.VITE_GAME_HEIGHT   ?? 600);
const PADDLE_W = Number(import.meta.env.VITE_PADDLE_WIDTH  ?? 12);
const PADDLE_H = Number(import.meta.env.VITE_PADDLE_HEIGHT ?? 80);
const BALL_R   = Number(import.meta.env.VITE_BALL_RADIUS   ?? 8);
const PLAYER_X = Number(import.meta.env.VITE_PLAYER_X      ?? 20);
const AI_X     = Number(import.meta.env.VITE_AI_X          ?? 768);

const API    = '/train-api';
const POLL   = 110; // ms

// ── gráfico SVG ──────────────────────────────────────────────────────────────

function FitnessChart({ history, unit = 'gen' }) {
    const W = 560, H = 180, PX = 40, PY = 16;

    if (!history.length) {
        return (
            <div className="w-full h-full flex items-center justify-center border border-white/10"
                 style={{ background: '#080808', height: H }}>
                <span className="font-mono text-xs text-white/20 uppercase tracking-widest">
                    aguardando dados…
                </span>
            </div>
        );
    }

    const means = history.map(h => h.mean);
    const bests = history.map(h => h.best);
    const stds  = history.map(h => h.std);
    const n     = history.length;

    const allVals = [...means, ...bests];
    const minV = Math.min(...allVals), maxV = Math.max(...allVals);
    const range = Math.max(maxV - minV, 0.5);

    const cx = i => PX + (i / Math.max(n - 1, 1)) * (W - PX - 8);
    const cy = v => PY + (1 - (v - minV) / range) * (H - PY - PY);

    const linePath = pts =>
        pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${cx(i).toFixed(1)},${cy(v).toFixed(1)}`).join(' ');

    // Faixa ±std ao redor da média
    const bandTop    = means.map((m, i) => [cx(i), cy(m - stds[i])]);
    const bandBottom = means.map((m, i) => [cx(i), cy(m + stds[i])]).reverse();
    const bandPath   = [...bandTop, ...bandBottom].map(([x, y], i) =>
        `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ') + 'Z';

    const gridY = [minV, (minV + maxV) / 2, maxV];
    const firstGen = history[0].gen;
    const lastGen  = history[n - 1].gen;

    return (
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="w-full block"
             style={{ background: '#080808', border: '1px solid rgba(255,255,255,0.08)' }}>
            {/* Grade horizontal */}
            {gridY.map((v, i) => (
                <g key={i}>
                    <line x1={PX} y1={cy(v)} x2={W - 8} y2={cy(v)}
                          stroke="rgba(255,255,255,0.06)" strokeDasharray="4,6" />
                    <text x={PX - 4} y={cy(v) + 4} textAnchor="end"
                          fill="rgba(255,255,255,0.25)" fontSize={9} fontFamily="monospace">
                        {v.toFixed(1)}
                    </text>
                </g>
            ))}

            {/* Eixos */}
            <line x1={PX} y1={PY} x2={PX} y2={H - PY}
                  stroke="rgba(255,255,255,0.12)" />
            <line x1={PX} y1={H - PY} x2={W - 8} y2={H - PY}
                  stroke="rgba(255,255,255,0.12)" />

            {/* Labels eixo X */}
            <text x={PX} y={H - 4} fill="rgba(255,255,255,0.2)" fontSize={9} fontFamily="monospace">
                {unit} {firstGen}
            </text>
            <text x={W - 8} y={H - 4} textAnchor="end"
                  fill="rgba(255,255,255,0.2)" fontSize={9} fontFamily="monospace">
                {unit} {lastGen}
            </text>

            {/* Faixa std */}
            {n > 1 && (
                <path d={bandPath} fill="rgba(0,240,255,0.06)" />
            )}

            {/* Linha best */}
            {n > 1 && (
                <path d={linePath(bests)}
                      fill="none" stroke="rgba(0,240,255,0.25)" strokeWidth={1}
                      strokeDasharray="4,4" />
            )}

            {/* Linha média */}
            {n > 1 && (
                <path d={linePath(means)}
                      fill="none" stroke="#00f0ff" strokeWidth={2} />
            )}

            {/* Ponto atual */}
            {n > 0 && (
                <circle cx={cx(n - 1)} cy={cy(means[n - 1])} r={3}
                        fill="#00f0ff" />
            )}

            {/* Legenda */}
            <line x1={W - 120} y1={12} x2={W - 104} y2={12} stroke="#00f0ff" strokeWidth={2} />
            <text x={W - 100} y={16} fill="rgba(0,240,255,0.7)" fontSize={9} fontFamily="monospace">média</text>
            <line x1={W - 60}  y1={12} x2={W - 44} y2={12} stroke="rgba(0,240,255,0.3)"
                  strokeWidth={1} strokeDasharray="4,3" />
            <text x={W - 40} y={16} fill="rgba(0,240,255,0.4)" fontSize={9} fontFamily="monospace">best</text>
        </svg>
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

const ALGOS = ['es', 'ppo'];

export function TrainingPanel() {
    const canvasRef    = useRef(null);
    const [info, setInfo]           = useState({ running: false, algo: 'es', generation: 0, total: 300 });
    const [histories, setHistories] = useState({ es: [], ppo: [] });
    const [algo, setAlgo]           = useState('es');
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
        } catch {
            setOffline(true);
        }
    }, []);

    useEffect(() => {
        poll();
        const id = setInterval(poll, POLL);
        return () => clearInterval(id);
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

    const pct = info.total > 0 ? Math.round((info.generation / info.total) * 100) : 0;

    const history    = histories[algo] ?? [];
    const lastRecord = history.at(-1);
    const isPpo      = algo === 'ppo';
    const metric     = isPpo ? 'return' : 'fitness';
    const unit       = isPpo ? 'step' : 'gen';
    const fmt        = (n) => (isPpo && n >= 1000 ? `${(n / 1000).toFixed(0)}k` : n);

    return (
        <div className="w-full flex flex-col gap-6">

            {/* ── cabeçalho ────────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h3 className="font-mono text-sm uppercase tracking-widest text-white/50">
                        {isPpo ? 'Proximal Policy Optimization' : 'Evolution Strategies'} — Training Monitor
                    </h3>
                    <div className="flex items-center gap-4">
                        {lastRecord && (
                            <>
                                <span className="font-mono text-xs text-punk-cyan/60">
                                    {metric} médio: {lastRecord.mean.toFixed(2)}
                                </span>
                                <span className="font-mono text-xs text-punk-cyan/40">
                                    best: {lastRecord.best.toFixed(2)}
                                </span>
                                <span className="font-mono text-xs text-punk-cyan/30">
                                    ±{lastRecord.std.toFixed(2)}
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
                        {isPpo ? 'Return por Rollout' : 'Fitness por Geração'}
                        <span className="text-white/15 ml-2">— média (linha) · best (tracejado) · ±std (faixa)</span>
                    </p>
                    <FitnessChart history={history} unit={unit} />
                </div>

                {/* Partida ao vivo */}
                <div className="flex flex-col gap-2 flex-none">
                    <p className="font-mono text-xs text-white/25 uppercase tracking-widest">
                        Partida ao Vivo — ES vs PPO
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
                        <span className="text-punk-pink/50">ES →</span>
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
