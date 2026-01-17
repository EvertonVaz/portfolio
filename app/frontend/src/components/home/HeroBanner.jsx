import React from 'react';
import { useTranslation } from 'react-i18next';

const HeroBanner = () => {
    const { t } = useTranslation();

    return (
        <>
            <span className='text-white/10'>{t('hero.under_construction')}</span>
            <div className="flex items-center justify-center mb-12">
                <span className="h-0.5 flex-1 bg-white opacity-20"></span>
                <p className="text-2xl md:text-3xl font-mono text-accent-green font-bold uppercase tracking-widest px-4">
                    {t('hero.born2code')}
                </p>
                <span className="h-0.5 flex-1 bg-white opacity-20"></span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter uppercase">
                Everton Vaz
            </h1>
        </>
    );
};

export default HeroBanner;
