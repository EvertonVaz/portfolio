import React from 'react';
import ModuleHeader from '../../../shared/ui/layout/ModuleHeader';
import ScrollSection from '../../../shared/ui/ScrollSection';
import BackToWorks from '../../../shared/ui/navigation/BackToWorks';
import { PongGame } from '../components/PongGame';
import PongDevlog from '../components/PongDevlog';
import PongArchitecture from '../components/PongArchitecture';
import { GithubCTA } from '../../../shared/ui/social/GithubCTA';

export default function PongPage() {
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

                <PongArchitecture />

                <PongDevlog />

                <GithubCTA url="https://github.com/EvertonVaz/portfolio/tree/main/app/backend/python/pong_ai" />

                <div className="flex justify-center mt-12">
                    <BackToWorks theme="cyan" />
                </div>
            </div>
        </ScrollSection>
    );
}
