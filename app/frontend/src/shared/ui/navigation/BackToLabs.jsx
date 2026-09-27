import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * BackToWorks - Botão de navegação para voltar à seção Works.
 * Usa âncora para scroll suave até a seção #work.
 */
const BackToWorks = ({ theme = 'pink' }) => {
    const { t } = useTranslation();

    const themeColors = {
        pink: 'hover:text-punk-pink hover:border-punk-pink',
        green: 'hover:text-punk-green hover:border-punk-green',
        cyan: 'hover:text-punk-cyan hover:border-punk-cyan',
    };

    const handleClick = (e) => {
        e.preventDefault();

        window.location.href = '/#work'

        const worksSection = document.getElementById('work');
        if (worksSection) {
            worksSection.scrollIntoView({ behavior: 'smooth' });
        } 
    };

    return (
        <a
            href="/#work"
            onClick={handleClick}
            className={`group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-white/50 ${themeColors[theme]} transition-colors border border-white/10 px-4 py-2 cursor-pointer`}
        >
            <span className="group-hover:-translate-x-1 transition-transform">&lt;</span>
            {t('shared.back_to_works')}
        </a>
    );
};

export default BackToWorks;
