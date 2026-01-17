import React from 'react';
import { useTranslation } from 'react-i18next';
import ProjectCard from './work/ProjectCard';

/**
 * Componente Workflow (Seção de Projetos).
 * Gerencia a lista de projetos e orquestra a renderização via ProjectCard.
 */
const Work = () => {
    const { t } = useTranslation();

    const projects = [
        { id: '01', title: t('work.projects.p01.title'), tag: 'C/C++', desc: t('work.projects.p01.desc'), path: t('work.projects.p01.path'), type: t('work.projects.p01.type') },
        { id: '02', title: t('work.projects.p02.title'), tag: 'React/Low-level', desc: t('work.projects.p02.desc'), path: t('work.projects.p02.path'), type: t('work.projects.p02.type') },
        { id: '03', title: t('work.projects.p03.title'), tag: 'React', desc: t('work.projects.p03.desc'), path: t('work.projects.p03.path'), type: t('work.projects.p03.type') },
    ];

    return (
        <div className="w-full max-w-6xl mx-auto p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
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
