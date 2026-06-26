import { useEffect, useRef } from 'react';
import { usePongChannel } from '../hooks/usePongChannel';

const W = 800;
const H = 600;
const PADDLE_W = 12;
const PADDLE_H = 80;
const BALL_R = 8;
const PLAYER_X = 20;
const AI_X = 768;

export function PongGame() {
    const canvasRef = useRef(null);
    const { gameStateRef, connected, gameOver, movePlayer, restart } = usePongChannel('lobby');
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
            <div className="flex items-center justify-between w-full max-w-4xl px-2">
                <span className="font-mono text-xs uppercase tracking-widest text-punk-cyan">
                    PLAYER
                </span>
                <div className={`px-3 py-1 text-xs font-mono flex items-center gap-2 border ${connected ? 'border-green-500/20 text-green-400' : 'border-red-500/20 text-red-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    {connected ? 'CONNECTED' : 'CONNECTING...'}
                </div>
                <span className="font-mono text-xs uppercase tracking-widest text-punk-pink">
                    AI
                </span>
            </div>

            <div className="relative w-full max-w-4xl">
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

            <div className="font-mono text-xs text-white/30 uppercase tracking-widest">
                ↑ / W &nbsp;|&nbsp; ↓ / S &nbsp;—&nbsp; mover raquete
            </div>
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
