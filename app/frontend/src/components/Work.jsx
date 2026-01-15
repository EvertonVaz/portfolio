import React from 'react';
import { useTranslation } from 'react-i18next';

const Work = () => {
    const { t } = useTranslation();

    const projects = [
        { id: '01', title: t('work.projects.p01.title'), tag: 'C/C++', desc: t('work.projects.p01.desc') },
        { id: '02', title: t('work.projects.p02.title'), tag: 'React', desc: t('work.projects.p02.desc') },
        { id: '03', title: t('work.projects.p03.title'), tag: 'Security', desc: t('work.projects.p03.desc') },
    ];

    return (
        <div className="w-full max-w-6xl mx-auto p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {projects.map((project) => (
                    <div key={project.id} className="group relative">
                        <div className="absolute -top-4 -left-4 text-6xl font-black text-white/5 group-hover:text-accent-pink/20 transition-colors duration-500">
                            {project.id}
                        </div>
                        <div className="punk-card-glass p-8 relative z-10">
                            <span className="inline-block px-2 py-1 bg-white text-black text-[10px] font-bold uppercase mb-4">
                                {project.tag}
                            </span>
                            <h3 className="text-2xl font-black uppercase mb-4 tracking-tighter">
                                {project.title}
                            </h3>
                            <p className="text-white/60 font-mono text-sm leading-relaxed mb-6">
                                {project.desc}
                            </p>
                            <button className="text-xs font-bold uppercase tracking-widest border-b-2 border-accent-green hover:text-accent-green transition-all pb-1 cursor-pointer">
                                {t('work.view_project')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Work;
