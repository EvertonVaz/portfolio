import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * FractalViewport - Responsável apenas pela camada de visualização e eventos de mouse.
 */
const FractalViewport = ({ params, onZoom, onPan, renderFn }) => {
    const { t } = useTranslation();
    const canvasRef = useRef(null);
    const dragRef = useRef({ isDragging: false, lastX: 0, lastY: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleNativeWheel = (e) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();

            // Ajusta coordenadas do mouse para dimensões internas do canvas (800x600)
            const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
            const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            onZoom(delta, mouseX, mouseY);
        };

        const handleMouseDown = (e) => {
            dragRef.current = { isDragging: true, lastX: e.clientX, lastY: e.clientY };
        };

        const handleMouseMove = (e) => {
            if (!dragRef.current.isDragging) return;

            const rect = canvas.getBoundingClientRect();
            // Escala o deslocamento do mouse para as dimensões internas do canvas
            const dx = (e.clientX - dragRef.current.lastX) * (canvas.width / rect.width);
            const dy = (e.clientY - dragRef.current.lastY) * (canvas.height / rect.height);

            dragRef.current.lastX = e.clientX;
            dragRef.current.lastY = e.clientY;

            onPan(dx, dy);
        };

        const handleMouseUp = () => {
            dragRef.current.isDragging = false;
        };

        canvas.addEventListener('wheel', handleNativeWheel, { passive: false });
        canvas.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            canvas.removeEventListener('wheel', handleNativeWheel);
            canvas.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [onZoom, onPan]);

    useEffect(() => {
        if (canvasRef.current) {
            renderFn(canvasRef.current, params);
        }
    }, [params, renderFn]);

    return (
        <div className="relative punk-card-glass p-2 overflow-hidden shadow-2xl">
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="max-w-full h-auto cursor-crosshair transition-opacity duration-300"
                style={{ imageRendering: 'pixelated' }}
            />
            <div className="absolute top-4 left-4 flex flex-col gap-1">
                <div className="bg-black/80 backdrop-blur-md px-3 py-1 border border-white/10 font-mono text-[10px] uppercase tracking-tighter text-accent-pink">
                    {params.type} :: {t('fractals.status')}
                </div>
                <div className="bg-black/60 backdrop-blur-sm px-3 py-1 border border-white/5 font-mono text-[9px] uppercase tracking-tighter text-white/50">
                    {t('fractals.zoom')}: {params.zoom.toExponential(2)}x
                </div>
            </div>

            {/* Grid Decorativa */}
            <div className="absolute inset-0 pointer-events-none border border-white/5 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]"></div>
        </div>
    );
};

export default FractalViewport;
