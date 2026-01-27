import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import ScrollSection from '../../../shared/ui/ScrollSection';
import FractalExplorer from '../components/FractalExplorer';
import FractalArchitecture from '../components/subcomponents/FractalArchitecture';
import { GithubCTA } from '../../../shared/ui/social/GithubCTA';
import ModuleHeader from '../../../shared/ui/layout/ModuleHeader';

const FractalPage = () => {
    const { t } = useTranslation();

    return (
        <ScrollSection id="fractals" className="py-24 text-white">
            <div className="max-w-7xl mx-auto px-8">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <ModuleHeader
                        theme="fractals"
                        titleKey="fractals.title"
                        introKey="fractals.description"
                        obsKey="fractals.lab_obs"
                    />

                    <Link
                        to="/"
                        className="group flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-white/50 hover:text-punk-pink transition-colors border border-white/10 px-4 py-2 hover:border-punk-pink mt-4"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">&lt;</span>
                        {t('fractals.back_to_work')}
                    </Link>
                </div>

                <FractalExplorer />
                <FractalArchitecture />
                <GithubCTA url="https://github.com/EvertonVaz/fractol" />
            </div>
        </ScrollSection>
    );
};

export default FractalPage;
