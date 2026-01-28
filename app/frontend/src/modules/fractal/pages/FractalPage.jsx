import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ScrollSection from '../../../shared/ui/ScrollSection';
import FractalViewport from '../components/subcomponents/FractalViewport';
import FractalControls from '../components/subcomponents/FractalControls';
import FractalArchitecture from '../components/subcomponents/FractalArchitecture';
import { GithubCTA } from '../../../shared/ui/social/GithubCTA';
import ModuleHeader from '../../../shared/ui/layout/ModuleHeader';
import { useFractalRenderer } from '../hooks/useFractalRenderer';
import BackToWorks from '../../../shared/ui/navigation/BackToWorks';

const FractalPage = () => {
    const { t } = useTranslation();

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
        <ScrollSection id="fractals" className="py-24 text-white">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <ModuleHeader
                    theme="fractals"
                    titleKey="fractals.title"
                    introKey="fractals.description"
                    obsKey="fractals.lab_obs"
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-24">

                    {/* Viewport - Área principal */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                            <div className="w-3 h-3 bg-punk-pink shadow-[0_0_8px_var(--color-punk-pink)]"></div>
                            <h4 className="font-mono text-xs uppercase tracking-widest text-white/60">
                                {t('fractals.real_time_render') || 'WebGL Real-time Rendering'}
                            </h4>
                        </div>
                        <FractalViewport
                            params={params}
                            onZoom={handleZoom}
                            onPan={handlePan}
                            renderFn={render}
                        />
                    </div>

                    {/* Sidebar - Controles */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                        <FractalControls
                            params={params}
                            onChange={setParams}
                            onReset={handleReset}
                        />
                    </div>

                </div>

                <FractalArchitecture />
                <GithubCTA url="https://github.com/EvertonVaz/fractol" />

                <div className="flex justify-center mt-12">
                    <BackToWorks theme="pink" />
                </div>
            </div>
        </ScrollSection>
    );
};

export default FractalPage;
