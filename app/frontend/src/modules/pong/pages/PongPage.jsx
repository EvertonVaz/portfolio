import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ModuleHeader from '../../../shared/ui/layout/ModuleHeader';
import ScrollSection from '../../../shared/ui/ScrollSection';
import BackToWorks from '../../../shared/ui/navigation/BackToWorks';
import { PongGame } from '../components/PongGame';

export default function PongPage() {
    const { t } = useTranslation();

    return (
        <ScrollSection id="pong" className="py-24 text-white">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <ModuleHeader
                    theme="pong"
                    titleKey="pong.title"
                    introKey="pong.intro"
                />

                <div className="mb-16">
                    <PongGame />
                </div>

                <div className="flex items-center gap-4 mb-12">
                    <div className="flex-1 h-px bg-white/5" />
                    <Link
                        to="/pong/training"
                        className="font-mono text-xs uppercase tracking-widest px-5 py-2 border border-punk-pink/40 text-punk-pink hover:bg-punk-pink/10 transition-colors"
                    >
                        {t('pong.training_link')} →
                    </Link>
                    <div className="flex-1 h-px bg-white/5" />
                </div>

                <div className="flex justify-center mt-12">
                    <BackToWorks theme="cyan" />
                </div>
            </div>
        </ScrollSection>
    );
}
