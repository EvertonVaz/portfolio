import React from 'react';
import { useTranslation } from 'react-i18next';
import ProjectCard from './ProjectCard';

/**
 * Componente Workflow (Seção de Projetos).
 * Gerencia a lista de projetos e orquestra a renderização via ProjectCard.
 */
const Work = () => {
    const { t } = useTranslation();

    // Cases de mundo real; as demos interativas vivem em /labs
    const projects = [
        { id: '01', title: t('work.cases.c01.title'), tag: 'Power BI/SQL', desc: t('work.cases.c01.desc'), path: '/journey#v20', type: 'internal' },
        { id: '02', title: t('work.cases.c02.title'), tag: 'Python/Postgres', desc: t('work.cases.c02.desc'), path: '/journey#v25', type: 'internal' },
        { id: '03', title: t('work.cases.c03.title'), tag: 'Python/API', desc: t('work.cases.c03.desc'), path: '/journey#v30', type: 'internal' },
        { id: '04', title: t('work.cases.c04.title'), tag: 'Haxe/Realtime', desc: t('work.cases.c04.desc'), path: '/journey#v40', type: 'internal' },
        { id: '05', title: t('work.cases.c05.title'), tag: 'Go/SSE', desc: t('work.cases.c05.desc'), path: '/journey#v45', type: 'internal' },
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
                        linkLabel={t('work.view_story')}
                    />
                ))}
            </div>
        </div>
    );
};

export default Work;
