import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import ReleaseEntry from '../components/ReleaseEntry';

// Dados neutros de idioma; copy vive no i18n (journey.releases.*)
// Ordem decrescente: release mais recente primeiro, como num changelog real
const RELEASES = [
    { id: 'v50', version: 'v5.0-beta', tags: ['pytorch', 'rl', 'elixir', 'websocket'], accent: 'cyan', current: true },
    { id: 'v45', version: 'v4.5', tags: ['go', 'lti 1.3', 'sse', 'payments'] },
    { id: 'v40', version: 'v4.0', tags: ['haxe', 'realtime', 'scorm'] },
    { id: 'v35', version: 'v3.5', tags: ['c', 'unix', '42'] },
    { id: 'v30', version: 'v3.0', tags: ['python', 'web scraping', 'bling api'] },
    { id: 'v25', version: 'v2.5', tags: ['python', 'postgres', 'cron', 'etl'] },
    { id: 'v20', version: 'v2.0', tags: ['power bi', 'm/dax', 'sql', 'python'] },
    { id: 'v1x', version: 'v1.x', tags: [] },
    { id: 'v10', version: 'v1.0', tags: [], accent: 'pink' },
    { id: 'v0x', version: 'v0.x', tags: [] },
];

/**
 * Página da Jornada (changelog de carreira).
 * SRP: Orquestra o cabeçalho e a linha do tempo de releases.
 */
const JourneyPage = () => {
    const { t } = useTranslation();
    const { hash } = useLocation();

    // Re-alinha a âncora após o layout estabilizar: o scroll inicial do HashLink
    // dispara durante a primeira renderização e para antes do alvo.
    useEffect(() => {
        if (!hash) return;
        const el = document.getElementById(hash.slice(1));
        if (!el) return;
        const timer = setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 400);
        return () => clearTimeout(timer);
    }, [hash]);

    return (
        <section className="w-full max-w-5xl mx-auto px-8 lg:px-12">
            {/* Section Header */}
            <div className="relative mb-12 md:mb-16">
                <div className="absolute -top-10 left-0 text-[80px] md:text-[120px] font-black text-white/5 pointer-events-none select-none uppercase tracking-tighter">
                    LOG
                </div>
                <div className="flex items-end justify-between border-b-2 border-white/10 pb-2">
                    <h2 className="text-3xl sm:text-4xl md:text-7xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
                        {t('journey.title')}
                    </h2>
                    <div className="hidden md:block text-right">
                        <span className="block text-xs font-mono text-punk-green mb-1"> SYSTEM.HISTORY.LOADED </span>
                        <span className="block h-1 w-32 bg-punk-green animate-pulse"></span>
                    </div>
                </div>
                <p className="font-mono text-sm text-white/50 mt-4">
                    {t('journey.intro')}
                </p>
            </div>

            {/* Changelog Timeline */}
            <ol className="relative border-l-2 border-white/10 ml-2 md:ml-4">
                {RELEASES.map((release) => (
                    <ReleaseEntry key={release.id} {...release} />
                ))}
            </ol>
        </section>
    );
};

export default JourneyPage;
