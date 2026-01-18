import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import FractalExplorer from '../components/Fractal/FractalExplorer';

const FractalPage = () => {
    const { t } = useTranslation();

    return (
        <section className="py-24">
            <div className="max-w-6xl mx-auto px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h2 className="section-title mb-2">
                            <span className="text-accent-pink">_</span> {t('fractals.title')}
                        </h2>
                        <p className="font-mono text-white/60 text-sm">
                            {t('fractals.description')}
                        </p>
                    </div>

                    <Link
                        to="/"
                        className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-accent-pink transition-colors group"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">←</span>
                        {t('fractals.back_to_work')}
                    </Link>
                </div>

                <FractalExplorer />
            </div>
        </section>
    );
};

export default FractalPage;
