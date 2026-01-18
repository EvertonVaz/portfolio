import React, { useState, useCallback } from 'react';
import { useFractalRenderer } from '../../hooks/useFractalRenderer';
import FractalViewport from './subcomponents/FractalViewport';
import FractalControls from './subcomponents/FractalControls';

/**
 * FractalExplorer - Orquestrador Principal (WebGL Version).
 */
const FractalExplorer = () => {
    const [params, setParams] = useState({
        type: 'mandelbrot',
        zoom: 1,
        offsetX: -0.5,
        offsetY: 0,
        maxIterations: 150,
        juliaReal: -0.7,
        juliaImag: 0.27
    });

    const { render, calculateZoomOffset, calculatePanOffset } = useFractalRenderer();

    const handlePan = useCallback((dx, dy) => {
        setParams(prev => {
            const { dOffsetX, dOffsetY } = calculatePanOffset(dx, dy, 800, 600, prev.zoom);
            return {
                ...prev,
                offsetX: prev.offsetX + dOffsetX,
                offsetY: prev.offsetY + dOffsetY
            };
        });
    }, [calculatePanOffset]);

    const handleZoom = useCallback((delta, mouseX, mouseY) => {
        setParams(prev => {
            const newZoom = prev.zoom * delta;
            if (newZoom < 0.1 || newZoom > 1e15) return prev;

            const { newOffsetX, newOffsetY } = calculateZoomOffset(
                mouseX, mouseY, 800, 600,
                prev.zoom, newZoom,
                prev.offsetX, prev.offsetY
            );

            return {
                ...prev,
                zoom: newZoom,
                offsetX: newOffsetX,
                offsetY: newOffsetY
            };
        });
    }, [calculateZoomOffset]);

    const handleReset = useCallback((newType) => {
        setParams({
            type: newType,
            zoom: 1,
            offsetX: newType === 'mandelbrot' ? -0.5 : 0,
            offsetY: 0,
            maxIterations: 150,
            juliaReal: -0.7,
            juliaImag: 0.27
        });
    }, []);

    return (
        <div className="flex flex-col xl:flex-row gap-12 items-start justify-center">
            <FractalViewport
                params={params}
                onZoom={handleZoom}
                onPan={handlePan}
                renderFn={render}
            />
            <FractalControls
                params={params}
                onChange={setParams}
                onReset={handleReset}
            />
        </div>
    );
};

export default FractalExplorer;
