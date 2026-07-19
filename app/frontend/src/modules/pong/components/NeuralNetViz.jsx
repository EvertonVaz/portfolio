import { useEffect, useRef, useState } from 'react';

const VIZ_W = 240;
const VIZ_H = Number(import.meta.env.VITE_GAME_HEIGHT ?? 600);
const MARGIN_X = 28;
const MARGIN_Y = 32;
const NODE_R = 5;

const CYAN = [0, 240, 255];
const PINK = [255, 45, 120];
const DARK = [20, 20, 36];

function lerpColor([r1, g1, b1], [r2, g2, b2], t) {
    return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
}

function normalize(values) {
    const max = Math.max(...values.map(Math.abs), 1e-6);
    return values.map(v => Math.abs(v) / max);
}

function drawNetwork(ctx, nnViz) {
    ctx.clearRect(0, 0, VIZ_W, VIZ_H);
    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, VIZ_W, VIZ_H);

    if (!nnViz) {
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('RULE-BASED', VIZ_W / 2, VIZ_H / 2);
        return;
    }

    const { layers, activations } = nnViz;
    const numLayers = layers.length;
    const availW = VIZ_W - MARGIN_X * 2;
    const availH = VIZ_H - MARGIN_Y * 2;

    // posições X de cada camada
    const xs = layers.map((_, i) => MARGIN_X + (availW / (numLayers - 1)) * i);

    // posições Y dos neurônios de cada camada
    const ys = layers.map((count) => {
        const spacing = availH / (count + 1);
        return Array.from({ length: count }, (_, j) => MARGIN_Y + spacing * (j + 1));
    });

    const normalized = activations.map(normalize);
    const outputMax = activations[activations.length - 1].indexOf(
        Math.max(...activations[activations.length - 1])
    );

    // Conexões — apenas entre camadas adjacentes, muito opacas
    for (let l = 0; l < numLayers - 1; l++) {
        for (let a = 0; a < layers[l]; a++) {
            for (let b = 0; b < layers[l + 1]; b++) {
                const srcAct = normalized[l][a];
                const dstAct = normalized[l + 1][b];
                const alpha = Math.max(srcAct, dstAct) * 0.12;
                ctx.strokeStyle = `rgba(0,240,255,${alpha.toFixed(3)})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(xs[l], ys[l][a]);
                ctx.lineTo(xs[l + 1], ys[l + 1][b]);
                ctx.stroke();
            }
        }
    }

    // Neurônios
    for (let l = 0; l < numLayers; l++) {
        const isOutput = l === numLayers - 1;
        const isInput = l === 0;

        for (let n = 0; n < layers[l]; n++) {
            const act = normalized[l][n];
            const x = xs[l];
            const y = ys[l][n];

            let color;
            if (isOutput) {
                color = n === outputMax
                    ? lerpColor(DARK, PINK, act)
                    : lerpColor(DARK, CYAN, act * 0.4);
            } else {
                color = lerpColor(DARK, isInput ? CYAN : CYAN, act);
            }

            // glow no neurônio ativo
            if (act > 0.5) {
                ctx.shadowColor = isOutput && n === outputMax ? '#ff2d78' : '#00f0ff';
                ctx.shadowBlur = act * 8;
            }

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, NODE_R, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // borda sutil
            ctx.strokeStyle = 'rgba(255,255,255,0.06)';
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }
    }

    // Labels das camadas
    const labels = ['INPUT', ...layers.slice(1, -1).map(() => 'HIDDEN'), 'OUTPUT'];
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    layers.forEach((_, i) => {
        ctx.fillStyle = i === numLayers - 1 ? 'rgba(255,45,120,0.5)' : 'rgba(0,240,255,0.3)';
        ctx.fillText(labels[i], xs[i], VIZ_H - 10);
    });

    // Label do output selecionado
    const actionLabels = ['UP', 'DOWN', 'STOP'];
    ctx.fillStyle = 'rgba(255,45,120,0.8)';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(actionLabels[outputMax] ?? '', xs[numLayers - 1], ys[numLayers - 1][outputMax] - NODE_R - 3);
}

export function NeuralNetViz({ gameStateRef }) {
    const canvasRef = useRef(null);
    const [algo, setAlgo] = useState('');

    useEffect(() => {
        let animId;
        function loop() {
            const canvas = canvasRef.current;
            const nnViz = gameStateRef.current?.nn_viz ?? null;
            if (canvas) {
                drawNetwork(canvas.getContext('2d'), nnViz);
            }
            setAlgo(nnViz?.algo ?? '');
            animId = requestAnimationFrame(loop);
        }
        animId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animId);
    }, [gameStateRef]);

    return (
        <div className="relative h-full" style={{ width: VIZ_W }}>
            <canvas
                ref={canvasRef}
                width={VIZ_W}
                height={VIZ_H}
                className="absolute inset-0 block w-full h-full border border-white/10"
                style={{ background: '#080808' }}
            />
            <span className="absolute top-2 left-0 right-0 text-center font-mono text-xs uppercase tracking-widest text-white/20 pointer-events-none">
                {algo}
            </span>
        </div>
    );
}
