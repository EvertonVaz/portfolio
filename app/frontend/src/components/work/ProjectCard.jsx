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
        <div className="group relative">
            {/* Background Decorativo */}
            <div className="absolute -top-4 -left-4 text-6xl font-black text-white/5 group-hover:text-accent-pink/20 transition-colors duration-500 select-none">
                {id}
            </div>

            <div className="punk-card-glass p-8 relative z-10 h-full flex flex-col">
                <span className="inline-block self-start px-2 py-1 bg-white text-black text-[10px] font-bold uppercase mb-4">
                    {tag}
                </span>

                <h3 className="text-2xl font-black uppercase mb-4 tracking-tighter">
                    {title}
                </h3>

                <p className="text-white/60 font-mono text-sm leading-relaxed mb-6 flex-1">
                    {desc}
                </p>

                {type === 'internal' ? (
                    <Link to={path} className="self-start text-xs font-bold uppercase tracking-widest border-b-2 border-accent-green hover:text-accent-green transition-all pb-1 cursor-pointer">
                        {t('work.view_project')}
                    </Link>
                ) : (
                    <button className="self-start text-xs font-bold uppercase tracking-widest border-b-2 border-accent-green hover:text-accent-green transition-all pb-1 cursor-pointer">
                        {t('work.view_project')}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProjectCard;
