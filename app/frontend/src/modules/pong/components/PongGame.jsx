import { useEffect, useRef } from 'react';
import { usePongChannel } from '../hooks/usePongChannel';
import { NeuralNetViz } from './NeuralNetViz';

const W        = Number(import.meta.env.VITE_GAME_WIDTH    ?? 800);
const H        = Number(import.meta.env.VITE_GAME_HEIGHT   ?? 600);
const PADDLE_W = Number(import.meta.env.VITE_PADDLE_WIDTH  ?? 12);
const PADDLE_H = Number(import.meta.env.VITE_PADDLE_HEIGHT ?? 80);
const BALL_R   = Number(import.meta.env.VITE_BALL_RADIUS   ?? 8);
const PLAYER_X = Number(import.meta.env.VITE_PLAYER_X      ?? 20);
const AI_X     = Number(import.meta.env.VITE_AI_X          ?? 768);

const MODEL_OPTIONS = ['ppo', 'ga'];

function ModelSelect({ value, onChange }) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-transparent border border-white/20 font-mono text-xs uppercase tracking-widest px-2 py-1 text-white/60 hover:border-white/40 focus:outline-none cursor-pointer"
        >
            {MODEL_OPTIONS.map((m) => (
                <option key={m} value={m} className="bg-black">{m.toUpperCase()}</option>
            ))}
        </select>
    );
}

export function PongGame() {
    const canvasRef = useRef(null);
    const { gameStateRef, connected, gameOver, mode, models, movePlayer, restart, setMode, setModels } = usePongChannel('lobby');
    const keysRef = useRef(new Set());

    // RAF render loop — bypasses React re-renders entirely for 60fps
    useEffect(() => {
        let animId;
        function loop() {
            if (gameStateRef.current && canvasRef.current) {
                draw(canvasRef.current.getContext('2d'), gameStateRef.current);
            }
            animId = requestAnimationFrame(loop);
        }
        animId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animId);
    }, [gameStateRef]);

    // Keyboard controls
    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key === 'ArrowUp' || e.key === 'w') {
                e.preventDefault();
                if (!keysRef.current.has('up')) {
                    keysRef.current.add('up');
                    movePlayer('up');
                }
            }
            if (e.key === 'ArrowDown' || e.key === 's') {
                e.preventDefault();
                if (!keysRef.current.has('down')) {
                    keysRef.current.add('down');
                    movePlayer('down');
                }
            }
        };

        const onKeyUp = (e) => {
            if (e.key === 'ArrowUp' || e.key === 'w') {
                keysRef.current.delete('up');
                if (!keysRef.current.has('down')) movePlayer('stop');
            }
            if (e.key === 'ArrowDown' || e.key === 's') {
                keysRef.current.delete('down');
                if (!keysRef.current.has('up')) movePlayer('stop');
            }
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        };
    }, [movePlayer]);

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex items-center justify-between w-full max-w-5xl px-2">
                <div className="flex items-center gap-2">
                    <span className="font-mono text-xs uppercase tracking-widest text-punk-cyan">
                        {mode === 'aivai' ? 'IA' : 'PLAYER'}
                    </span>
                    {mode === 'aivai' && (
                        <ModelSelect value={models.player} onChange={(m) => setModels(models.ai, m)} />
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setMode(mode === 'aivai' ? 'pvp' : 'aivai')}
                        className={`font-mono text-xs uppercase tracking-widest px-3 py-1 border transition-colors ${
                            mode === 'aivai'
                                ? 'border-punk-pink/40 text-punk-pink hover:bg-punk-pink/10'
                                : 'border-white/20 text-white/40 hover:border-white/40 hover:text-white/70'
                        }`}
                    >
                        {mode === 'aivai' ? 'IA VS IA' : 'IA VS IA'}
                    </button>
                    <div className={`px-3 py-1 text-xs font-mono flex items-center gap-2 border ${connected ? 'border-green-500/20 text-green-400' : 'border-red-500/20 text-red-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        {connected ? 'CONNECTED' : 'CONNECTING...'}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ModelSelect value={models.ai} onChange={(m) => setModels(m, models.player)} />
                    <span className="font-mono text-xs uppercase tracking-widest text-punk-pink">
                        IA
                    </span>
                </div>
            </div>

            <div className="flex items-stretch gap-4 w-full max-w-5xl">
                <div className="relative flex-1">
                    <canvas
                        ref={canvasRef}
                        width={W}
                        height={H}
                        className="w-full border border-white/10"
                        style={{ background: '#080808', aspectRatio: `${W}/${H}` }}
                    />

                    {gameOver && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                            <p className="font-mono text-4xl font-black uppercase text-white mb-2">
                                {gameStateRef.current?.player?.score >= 7 ? 'VOCÊ GANHOU' : 'IA GANHOU'}
                            </p>
                            <p className="font-mono text-sm text-white/40 mb-8 uppercase tracking-widest">
                                {gameStateRef.current?.player?.score} — {gameStateRef.current?.ai?.score}
                            </p>
                            <button
                                onClick={restart}
                                className="font-mono text-xs uppercase tracking-widest px-6 py-3 border border-punk-cyan text-punk-cyan hover:bg-punk-cyan/10 transition-colors"
                            >
                                JOGAR NOVAMENTE
                            </button>
                        </div>
                    )}
                </div>

                <NeuralNetViz gameStateRef={gameStateRef} />
            </div>

            {mode !== 'aivai' && (
                <div className="font-mono text-xs text-white/30 uppercase tracking-widest">
                    ↑ / W &nbsp;|&nbsp; ↓ / S &nbsp;—&nbsp; mover raquete
                </div>
            )}
        </div>
    );
}

function draw(ctx, { ball, player, ai }) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, W, H);

    // Linha central tracejada
    ctx.setLineDash([8, 12]);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Placar
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.font = 'bold 52px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(player.score, W / 4, 72);
    ctx.fillText(ai.score, (W * 3) / 4, 72);

    // Raquete do jogador — cyan
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;
    ctx.fillRect(PLAYER_X, player.y, PADDLE_W, PADDLE_H);

    // Raquete da IA — pink
    ctx.fillStyle = '#ff2d78';
    ctx.shadowColor = '#ff2d78';
    ctx.shadowBlur = 8;
    ctx.fillRect(AI_X, ai.y, PADDLE_W, PADDLE_H);

    // Bola
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
}
