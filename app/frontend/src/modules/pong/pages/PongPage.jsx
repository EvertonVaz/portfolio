import React from 'react';
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

                <div className="flex justify-center mt-12">
                    <BackToWorks theme="cyan" />
                </div>
            </div>
        </ScrollSection>
    );
}
