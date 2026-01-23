import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import FractalExplorer from '../components/FractalExplorer';
import FractalArchitecture from '../components/subcomponents/FractalArchitecture';
import { GithubCTA } from '../../../shared/ui/GithubCTA';

const FractalPage = () => {
    const { t } = useTranslation();

    return (
        <section className="py-24">
            <div className="max-w-6xl mx-auto px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 border-b-2 border-white/10 pb-8">
                    <div>
                        <h2 className="text-5xl md:text-7xl font-black mb-2 uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-punk-pink to-white">
                            {t('fractals.title')}
                        </h2>
                        <p className="font-mono text-punk-pink/80 text-sm border-l-2 border-punk-pink pl-3 mt-4">
                            &gt; {t('fractals.description')}
                        </p>
                    </div>

                    <Link
                        to="/"
                        className="group flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-white/50 hover:text-punk-pink transition-colors border border-white/10 px-4 py-2 hover:border-punk-pink"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">&lt;</span>
                        {t('fractals.back_to_work')}
                    </Link>
                </div>

                <FractalExplorer />
                <FractalArchitecture />
                <GithubCTA url="https://github.com/EvertonVaz/fractol" />
            </div>
        </section>
    );
};

export default FractalPage;
