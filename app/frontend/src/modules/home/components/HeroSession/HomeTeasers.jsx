import { useTranslation } from 'react-i18next';
import { HashLink } from 'react-router-hash-link';
import { Link } from 'react-router-dom';

// Últimas releases da jornada; copy vive no i18n (journey.releases.*)
const RELEASES = [
    { id: 'v50', version: 'v5.0-beta', color: 'text-punk-cyan' },
    { id: 'v45', version: 'v4.5', color: 'text-punk-green' },
    { id: 'v40', version: 'v4.0', color: 'text-punk-green' },
];

// Demos ao vivo; títulos vivem no i18n (work.projects.*)
const DEMOS = [
    { key: 'p01', color: 'text-punk-green' },
    { key: 'p02', color: 'text-punk-pink' },
    { key: 'p03', color: 'text-punk-cyan' },
    { key: 'p04', color: 'text-punk-green' },
];

/**
 * HomeTeasers - Previews da Jornada e do Labs em formato de terminal (SRP).
 */
const HomeTeasers = () => {
    const { t } = useTranslation();

    return (
        <div className="w-full max-w-5xl mx-auto mt-6 px-4 lg:px-0 grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
            {/* Journey Teaser */}
            <div className="bg-punk-gray/80 border-2 border-white/20 p-2 font-mono text-sm shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-[8px_8px_0px_0px_rgba(0,255,255,0.5)] transition-shadow duration-300">
                <div className="flex items-center justify-between bg-black/50 p-2 mb-4 border-b border-white/10">
                    <span className="text-white/50 text-xs tracking-widest uppercase"> user@portfolio:~$ tail -3 journey.log </span>
                </div>
                <div className="p-4 flex flex-col gap-3">
                    {RELEASES.map((release) => (
                        <HashLink
                            key={release.id}
                            smooth
                            to={`/journey#${release.id}`}
                            className="flex flex-wrap items-baseline gap-x-3 gap-y-1 group"
                        >
                            <span className={`${release.color} text-xs group-hover:scale-105 transition-transform duration-300`}>
                                {release.version}
                            </span>
                            <span className="text-white/80 uppercase font-bold group-hover:text-white transition-colors">
                                {t(`journey.releases.${release.id}.label`)}
                            </span>
                            <span className="text-white/30 text-xs uppercase">
                                {t(`journey.releases.${release.id}.period`)}
                            </span>
                        </HashLink>
                    ))}
                </div>
                <Link to="/journey" className="block px-4 pb-2 text-xs text-punk-cyan/70 hover:text-punk-cyan transition-colors">
                    &gt; {t('home.view_changelog')}_
                </Link>
            </div>

            {/* Labs Teaser */}
            <div className="bg-punk-gray/80 border-2 border-white/20 p-2 font-mono text-sm shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-[8px_8px_0px_0px_rgba(57,255,20,0.5)] transition-shadow duration-300">
                <div className="flex items-center justify-between bg-black/50 p-2 mb-4 border-b border-white/10">
                    <span className="text-white/50 text-xs tracking-widest uppercase"> user@portfolio:~$ ls ./labs </span>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {DEMOS.map((demo) => (
                        <Link key={demo.key} to={t(`work.projects.${demo.key}.path`)} className="flex items-center gap-3 group">
                            <span className={`${demo.color} group-hover:scale-125 transition-transform duration-300`}>&gt;</span>
                            <span className="text-white/80 group-hover:text-white transition-colors lowercase">
                                {t(`work.projects.${demo.key}.title`).replaceAll(' ', '_')}
                            </span>
                        </Link>
                    ))}
                </div>
                <Link to="/labs" className="block px-4 pb-2 text-xs text-punk-green/70 hover:text-punk-green transition-colors">
                    &gt; {t('home.enter_labs')}_
                </Link>
            </div>
        </div>
    );
};

export default HomeTeasers;
