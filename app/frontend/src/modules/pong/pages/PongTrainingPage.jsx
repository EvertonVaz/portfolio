import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ModuleHeader from '../../../shared/ui/layout/ModuleHeader';
import ScrollSection from '../../../shared/ui/ScrollSection';
import { TrainingPanel } from '../components/TrainingPanel';

export default function PongTrainingPage() {
    const { t } = useTranslation();

    return (
        <ScrollSection id="pong-training" className="py-24 text-white">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <ModuleHeader
                    theme="pong"
                    titleKey="pong.training_title"
                    introKey="pong.training_intro"
                />

                <div className="mb-16">
                    <TrainingPanel />
                </div>

                <div className="flex justify-center mt-12">
                    <Link
                        to="/pong"
                        className="font-mono text-xs uppercase tracking-widest px-6 py-3 border border-punk-cyan/50 text-punk-cyan hover:bg-punk-cyan/10 transition-colors"
                    >
                        ← {t('pong.back_to_game')}
                    </Link>
                </div>
            </div>
        </ScrollSection>
    );
}
