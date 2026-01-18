import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * HeroBanner - Cabeçalho compacto e impactante.
 */
const HeroBanner = () => {
    const { t } = useTranslation();

    return (
        <div className="mb-16">
            {/* Status Badge */}
            <div className="flex items-center justify-center gap-3 mb-8">
                <span className="h-2 w-2 rounded-full bg-accent-green animate-pulse"></span>
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                    {t('hero.under_construction')}
                </span>
            </div>

            {/* Nome Principal */}
            <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tighter uppercase bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent">
                Everton Vaz
            </h1>

            {/* Role Badge */}
            <div className="flex items-center justify-center gap-4">
                <span className="h-px flex-1 max-w-16 bg-gradient-to-r from-transparent to-white/20"></span>
                <span className="text-lg md:text-xl font-mono text-accent-green font-bold uppercase tracking-widest">
                    {t('hero.born2code')}
                </span>
                <span className="h-px flex-1 max-w-16 bg-gradient-to-l from-transparent to-white/20"></span>
            </div>
        </div>
    );
};

export default HeroBanner;
