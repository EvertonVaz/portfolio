import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Settings } from 'lucide-react';

export default function SimulationControl({ onStart, disabled }) {
    const { t } = useTranslation();
    const [params, setParams] = useState({
        n: 5,
        die: 2,
        eat: 1,
        sleep: 1,
        must_eat: 3
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onStart(params.n, params.die, params.eat, params.sleep, params.must_eat);
    };

    return (
        <div className="punk-card-glass relative overflow-hidden group">
            {/* Design Decorative Element */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-punk-cyan/5 -rotate-45 translate-x-8 -translate-y-8 group-hover:bg-punk-cyan/10 transition-colors"></div>

            <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
                <Settings className="w-4 h-4 text-punk-cyan animate-pulse" />
                <h3 className="text-sm font-mono uppercase tracking-[0.2em] text-white/90">
                    {t('philosophers.control_title')}
                </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                        step="1"
                        min="1" max="5"
                    />
                    <Input
                        label={t('philosophers.label_eat')}
                        value={params.eat}
                        onChange={v => setParams({ ...params, eat: v })}
                        step="1"
                        min="1" max="5"
                    />
                    <Input
                        label={t('philosophers.label_sleep')}
                        value={params.sleep}
                        onChange={v => setParams({ ...params, sleep: v })}
                        step="1"
                        min="1" max="5"
                    />
                    <div className="sm:col-span-2">
                        <Input
                            label={t('philosophers.label_must_eat') || "Philosopher Quota (Must Eat)"}
                            value={params.must_eat}
                            onChange={v => setParams({ ...params, must_eat: v })}
                            min="2" max="10"
                            description={t('philosophers.must_eat_desc') || "Encerrar após cada um comer X vezes (min: 2)"}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={disabled}
                    className="w-full mt-6 flex items-center justify-center gap-3 px-6 py-4 bg-white text-black font-black uppercase tracking-tighter hover:bg-punk-cyan hover:text-black transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group"
                >
                    <Play className={`w-4 h-4 ${!disabled && 'group-hover:scale-125 transition-transform'}`} />
                    {disabled ? t('philosophers.btn_connecting') : t('philosophers.btn_start')}
                </button>
            </form>
        </div>
    );
}

function Input({ label, value, onChange, description, ...props }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{label}</label>
                {props.min && <span className="text-[9px] text-white/20 font-mono">MIN: {props.min}</span>}
            </div>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-punk-bg border border-white/10 px-4 py-3 text-sm text-white font-mono focus:border-punk-cyan/50 focus:ring-1 focus:ring-punk-cyan/20 focus:outline-none transition-all"
                {...props}
            />
            {description && (
                <p className="text-[9px] font-mono text-punk-cyan/40 leading-relaxed italic">
                    // {description}
                </p>
            )}
        </div>
    )
}
