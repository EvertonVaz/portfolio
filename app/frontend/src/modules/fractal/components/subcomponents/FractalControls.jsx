import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * FractalControls - Responsável apenas pela interface de controle e parametrização.
 */
const FractalControls = ({ params, onChange, onReset }) => {
    const { t } = useTranslation();

    const handleParamChange = (key, value) => {
        onChange({ ...params, [key]: value });
    };

    return (
        <div className="w-full lg:max-w-md space-y-8 animate-in fade-in slide-in-from-right duration-700">
            {/* Seletor de Tipo */}
            <div className="space-y-4">
                <label className="block font-mono text-xs uppercase tracking-tighter text-white/50">
                    {t('fractals.type_label')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {['mandelbrot', 'julia'].map((type) => (
                        <button
                            key={type}
                            onClick={() => onReset(type)}
                            className={`px-4 py-3 font-mono text-[10px] uppercase border transition-all duration-300 ${params.type === type
                                ? 'bg-accent-pink border-accent-pink text-white shadow-[0_0_15px_rgba(255,46,126,0.3)]'
                                : 'border-white/10 text-white/40 hover:border-white/30'
                                }`}
                        >
                            {t(`fractals.${type}`)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Configurações de Precisão */}
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-white/30">
                        {t('fractals.iterations')}
                    </label>
                    <input
                        type="range"
                        min="50"
                        max="500"
                        step="50"
                        value={params.maxIterations}
                        onChange={(e) => handleParamChange('maxIterations', parseInt(e.target.value))}
                        className="w-full accent-accent-pink bg-white/5 appearance-none h-1 rounded-full cursor-pointer"
                    />
                    <div className="text-right font-mono text-[10px] text-accent-pink">{params.maxIterations}</div>
                </div>

                <div className="space-y-3">
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-white/30">
                        {t('fractals.precision')}
                    </label>
                    <div className="px-3 py-2 bg-white/5 border border-white/10 font-mono text-xs text-white/60">
                        {params.zoom < 1e5 ? t('fractals.standard') : t('fractals.high_res')}
                    </div>
                </div>
            </div>

            {/* Coordenadas Customizadas (Julia) */}
            {params.type === 'julia' && (
                <div className="space-y-5 pt-8 border-t border-white/10 animate-in zoom-in-95 duration-500">
                    <label className="block font-mono text-xs uppercase tracking-tighter text-white/50 flex justify-between">
                        {t('fractals.coordinates')}
                        <span className="text-[10px] text-accent-pink opacity-50">complex_plane</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block font-mono text-[9px] uppercase text-white/40">{t('fractals.real')}</label>
                            <input
                                type="number"
                                step="0.005"
                                value={params.juliaReal}
                                onChange={(e) => handleParamChange('juliaReal', parseFloat(e.target.value) || 0)}
                                className="w-full bg-white/5 border border-white/10 p-3 font-mono text-xs text-white outline-none focus:border-accent-pink transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block font-mono text-[9px] uppercase text-white/40">{t('fractals.imaginary')}</label>
                            <input
                                type="number"
                                step="0.005"
                                value={params.juliaImag}
                                onChange={(e) => handleParamChange('juliaImag', parseFloat(e.target.value) || 0)}
                                className="w-full bg-white/5 border border-white/10 p-3 font-mono text-xs text-white outline-none focus:border-accent-pink transition-colors"
                            />
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default FractalControls;
