import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Settings } from 'lucide-react';

export default function SimulationControl({ onStart, disabled }) {
    const { t } = useTranslation();
    const [params, setParams] = useState({
        n: 5,
        die: 0.8,
        eat: 0.2,
        sleep: 0.2
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onStart(params.n, params.die, params.eat, params.sleep);
    };

    return (
        <div className="p-6 rounded-lg border border-gray-800 bg-gray-900/50 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-6 text-gray-400">
                <Settings className="w-4 h-4" />
                <h3 className="text-sm font-mono uppercase tracking-wider">{t('philosophers.control_title')}</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label={t('philosophers.label_philosophers')}
                        value={params.n}
                        onChange={v => setParams({ ...params, n: v })}
                        min="1" max="20"
                    />
                    <Input
                        label={t('philosophers.label_die')}
                        value={params.die}
                        onChange={v => setParams({ ...params, die: v })}
                        step="0.1"
                    />
                    <Input
                        label={t('philosophers.label_eat')}
                        value={params.eat}
                        onChange={v => setParams({ ...params, eat: v })}
                        step="0.1"
                    />
                    <Input
                        label={t('philosophers.label_sleep')}
                        value={params.sleep}
                        onChange={v => setParams({ ...params, sleep: v })}
                        step="0.1"
                    />
                </div>

                <button
                    type="submit"
                    disabled={disabled}
                    className="w-full mt-4 group relative px-4 py-3 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/50 text-blue-400 rounded transition-all duration-300 flex items-center justify-center gap-2 font-mono text-sm uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Play className="w-4 h-4" />
                    {disabled ? t('philosophers.btn_connecting') : t('philosophers.btn_start')}
                </button>
            </form>
        </div>
    );
}

function Input({ label, value, onChange, ...props }) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-500 uppercase">{label}</label>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-black/40 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 font-mono focus:border-blue-500/50 focus:outline-none transition-colors"
                {...props}
            />
        </div>
    )
}
