import React from 'react';
import { useTranslation } from 'react-i18next';

const THEMES = {
    terminal: { border: 'border-accent-green' },
    philosophers: { border: 'border-punk-cyan' },
    fractals: { border: 'border-punk-pink' },
    pong: { border: 'border-punk-cyan' }
};

const InfoBox = ({ theme = 'terminal', contentKey }) => {
    const { t } = useTranslation();
    const config = THEMES[theme] || THEMES.terminal;

    return (
        <div className={`mt-16 max-w-2xl mx-auto p-4 bg-white/5 border-l-2 ${config.border} font-mono text-[10px] text-white/40 leading-relaxed uppercase tracking-tighter`}>
            {t(contentKey)}
        </div>
    );
};

export default InfoBox;
