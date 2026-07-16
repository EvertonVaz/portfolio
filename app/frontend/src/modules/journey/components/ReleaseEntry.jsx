import React from 'react';
import { useTranslation } from 'react-i18next';

const ACCENTS = {
    green: {
        chip: 'text-punk-green border-punk-green/40',
        dot: 'bg-punk-green',
    },
    pink: {
        chip: 'text-punk-pink border-punk-pink/40',
        dot: 'bg-punk-pink',
    },
    cyan: {
        chip: 'text-punk-cyan border-punk-cyan/40',
        dot: 'bg-punk-cyan',
    },
};

/**
 * Uma entrada do changelog da jornada.
 * SRP: Responsável apenas pela exibição de uma release.
 */
const ReleaseEntry = ({ id, version, tags = [], accent = 'green', current = false }) => {
    const { t } = useTranslation();
    const colors = ACCENTS[accent] || ACCENTS.green;

    return (
        <li id={id} className="relative pl-8 md:pl-10 pb-12 last:pb-0 group scroll-mt-28">
            {/* Marcador na linha do tempo */}
            <span
                className={`absolute left-0 top-1.5 -translate-x-1/2 w-3 h-3 border-2 border-punk-bg ${colors.dot} ${current ? 'animate-pulse' : ''}`}
            />

            {/* Cabeçalho da release */}
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-3">
                <span className={`font-mono text-xs px-2 py-0.5 border ${colors.chip} tracking-widest`}>
                    {version}
                </span>
                <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-white group-hover:text-punk-green transition-colors duration-300">
                    {t(`journey.releases.${id}.label`)}
                </h3>
                <span className="font-mono text-xs text-white/40 uppercase tracking-widest">
                    {t(`journey.releases.${id}.period`)}
                </span>
            </div>

            {/* Corpo */}
            <p className="font-mono text-sm text-white/70 leading-relaxed max-w-2xl mb-3">
                {t(`journey.releases.${id}.body`)}
            </p>

            {/* Stack tags */}
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 border border-white/15 text-white/50"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </li>
    );
};

export default ReleaseEntry;
