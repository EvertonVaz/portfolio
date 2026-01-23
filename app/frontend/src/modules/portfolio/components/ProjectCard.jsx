import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

/**
 * Componente de Cartão de Projeto Individual.
 * SRP: Responsável apenas pela exibição de um único projeto.
 */
const ProjectCard = ({ id, title, tag, desc, path, type }) => {
    const { t } = useTranslation();

    return (
        <div className="group relative h-full">
            {/* Background Hover Effect (Scanlines/Glitch) - CSS Based */}
            <div className="absolute inset-0 bg-punk-gray/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10"
                style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 3px)' }}></div>

            {/* Shadow Block */}
            <div className="absolute top-2 left-2 w-full h-full bg-punk-gray border-2 border-white/10 -z-20 transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2"></div>

            <div className="relative bg-punk-bg border-2 border-white/20 p-8 h-full flex flex-col hover:border-white transition-colors duration-300 overflow-hidden">
                {/* ID Stamped */}
                <div className="absolute -right-4 -top-4 text-8xl font-black text-white/5 select-none group-hover:text-punk-pink/10 transition-colors duration-500 font-sans tracking-tighter">
                    {id}
                </div>

                {/* Tag */}
                <span className="inline-block self-start px-3 py-1 bg-white text-black text-xs font-black uppercase mb-6 tracking-widest border border-white group-hover:bg-punk-green group-hover:border-punk-green transition-colors duration-300">
                    {tag}
                </span>

                {/* Title */}
                <h3 className="text-3xl font-black uppercase mb-4 tracking-tighter group-hover:text-punk-cyan transition-colors duration-300">
                    {title}
                </h3>

                {/* Description */}
                <p className="text-white/60 font-mono text-sm leading-relaxed mb-8 flex-1 border-l-2 border-white/10 pl-4 group-hover:border-punk-pink/50 transition-colors duration-300">
                    {desc}
                </p>

                {/* Action Button/Link */}
                {type === 'internal' ? (
                    <Link to={path} className="self-start relative px-6 py-3 bg-white/5 border border-white/20 text-xs font-bold uppercase tracking-widest hover:bg-punk-green hover:text-black hover:border-punk-green transition-all group-hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
                        {t('work.view_project')} &gt;
                    </Link>
                ) : (
                    <button className="self-start relative px-6 py-3 bg-white/5 border border-white/20 text-xs font-bold uppercase tracking-widest hover:bg-punk-pink hover:text-black hover:border-punk-pink transition-all group-hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
                        {t('work.view_project')} &gt;
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProjectCard;
