import React from 'react';
import { useTranslation } from 'react-i18next';

const THEMES = {
    terminal: {
        color: 'text-punk-green',
        border: 'border-l-4 border-l-punk-green',
        ghost: 'TERM',
        prefix: '_',
        ghostSize: 'text-[120px]'
    },
    philosophers: {
        color: 'text-punk-cyan',
        border: 'border-l-4 border-l-punk-cyan',
        ghost: 'LOGIC',
        prefix: '/',
        ghostSize: 'text-[100px]'
    },
    fractals: {
        color: 'text-punk-pink',
        border: 'border-l-4 border-l-punk-pink',
        ghost: 'MATH',
        prefix: '*',
        ghostSize: 'text-[100px]'
    },
    pong: {
        color: 'text-punk-cyan',
        border: 'border-l-4 border-l-punk-cyan',
        ghost: 'PONG',
        prefix: '>',
        ghostSize: 'text-[120px]'
    }
};

const ModuleHeader = ({ theme = 'terminal', titleKey, introKey }) => {
    const { t } = useTranslation();
    const config = THEMES[theme] || THEMES.terminal;

    return (
        <div className="max-w-3xl mx-auto text-center mb-12 relative">
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-[100px] font-black text-white/5 pointer-events-none select-none uppercase tracking-tighter">
                {config.ghost}
            </div>
            <h2 className={`text-4xl md:text-5xl font-black uppercase mb-6 flex items-center justify-center gap-4 ${config.color} tracking-tighter`}>
                <span className="animate-pulse">{config.prefix}</span> {t(titleKey)}
            </h2>
            <div className={`punk-card-glass p-6 ${config.border} text-left mb-4`}>
                <p className="font-mono text-white/80 text-sm leading-relaxed mb-4">
                    {t(introKey)}
                </p>
            </div>
        </div>
    );
};

export default ModuleHeader;
