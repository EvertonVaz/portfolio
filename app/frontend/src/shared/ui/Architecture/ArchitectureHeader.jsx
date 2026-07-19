import React from 'react';
import { useTranslation } from 'react-i18next';

const THEMES = {
    terminal: { color: 'text-accent-green', bg: 'bg-accent-green/10', border: 'border-accent-green/20' },
    philosophers: { color: 'text-punk-cyan', bg: 'bg-punk-cyan/10', border: 'border-punk-cyan/20' },
    fractals: { color: 'text-punk-pink', bg: 'bg-punk-pink/10', border: 'border-punk-pink/20' },
    pong: { color: 'text-punk-cyan', bg: 'bg-punk-cyan/10', border: 'border-punk-cyan/20' }
};

const ArchitectureHeader = ({ theme = 'terminal', subtitleKey }) => {
    const { t } = useTranslation();
    const config = THEMES[theme] || THEMES.terminal;

    return (
        <div className="max-w-4xl mx-auto text-center mb-16">
            <div className={`inline-block px-3 py-1 ${config.bg} border ${config.border} rounded-full mb-4`}>
                <span className={`text-[10px] font-mono ${config.color} uppercase tracking-[0.2em]`}>
                    {t('shared.technical_specs')}
                </span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-4 uppercase tracking-tighter">
                {t('shared.architecture_title')}
            </h3>
            <p className="text-white/50 font-mono text-xs italic max-w-lg mx-auto">
                {t(subtitleKey)}
            </p>
        </div>
    );
};

export default ArchitectureHeader;
