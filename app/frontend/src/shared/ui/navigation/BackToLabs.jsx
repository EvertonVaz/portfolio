import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * BackToLabs - Botão de navegação das demos de volta ao /labs, de onde o visitante veio.
 */
const BackToLabs = ({ theme = 'pink' }) => {
    const { t } = useTranslation();

    const themeColors = {
        pink: 'hover:text-punk-pink hover:border-punk-pink',
        green: 'hover:text-punk-green hover:border-punk-green',
        cyan: 'hover:text-punk-cyan hover:border-punk-cyan',
    };

    return (
        <Link
            to="/labs"
            className={`group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-white/50 ${themeColors[theme]} transition-colors border border-white/10 px-4 py-2 cursor-pointer`}
        >
            <span className="group-hover:-translate-x-1 transition-transform">&lt;</span>
            {t('shared.back_to_labs')}
        </Link>
    );
};

export default BackToLabs;
