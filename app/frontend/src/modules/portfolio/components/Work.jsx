import React from 'react';
import { useTranslation } from 'react-i18next';
import ProjectCard from './ProjectCard';

/**
 * Componente Workflow (Seção de Projetos).
 * Gerencia a lista de projetos e orquestra a renderização via ProjectCard.
 */
const Work = () => {
    const { t } = useTranslation();

    const projects = [
        { id: '01', title: t('work.projects.p01.title'), tag: 'C/C++', desc: t('work.projects.p01.desc'), path: t('work.projects.p01.path'), type: t('work.projects.p01.type') },
        { id: '02', title: t('work.projects.p02.title'), tag: 'JSX/Math', desc: t('work.projects.p02.desc'), path: t('work.projects.p02.path'), type: t('work.projects.p02.type') },
        { id: '03', title: t('work.projects.p03.title'), tag: 'Elixir/C', desc: t('work.projects.p03.desc'), path: t('work.projects.p03.path'), type: t('work.projects.p03.type') },
    ];

    return (
        <div className="w-full max-w-7xl mx-auto px-8 lg:px-12">
            {/* Section Header */}
            <div className="flex items-end justify-between mb-4 border-b-2 border-white/10 pb-2">
                <h2 className="text-3xl sm:text-4xl md:text-7xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
                    {t('work.title')}
                </h2>
                <div className="hidden md:block text-right">
                    <span className="block text-xs font-mono text-punk-green mb-1"> SYSTEM.PROJECTS.LOADED </span>
                    <span className="block h-1 w-32 bg-punk-green animate-pulse"></span>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8 md:gap-y-16 mb-8 md:mb-12">
                {projects.map((project) => (
                    <ProjectCard
                        key={project.id}
                        {...project}
                    />
                ))}
            </div>
        </div>
    );
};

export default Work;
