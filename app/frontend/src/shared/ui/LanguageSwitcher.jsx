import React from 'react';
import { MdTranslate } from 'react-icons/md';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = ({ mobile = false }) => {
    const { i18n } = useTranslation();
    const { t } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language.startsWith('pt') ? 'en' : 'pt';
        i18n.changeLanguage(newLang);
    };

    const isPt = i18n.language.startsWith('pt');

    if (mobile) {
        return (
            <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 font-mono text-[9px] border border-white/20 px-1.5 py-0.5 hover:border-accent-pink transition-all"
            >
                <MdTranslate size={12} className="text-accent-pink" />
                {isPt ? 'EN' : 'PT'}
            </button>
        );
    }

    return (
        <button
            onClick={toggleLanguage}
            className="group flex items-center gap-1 font-mono text-[10px] border border-white/20 px-2 py-1 hover:border-accent-pink hover:bg-accent-pink/5 transition-all duration-300 uppercase tracking-tighter relative overflow-hidden"
            title={isPt ? 'Switch to English' : 'Mudar para Português'}
        >
            <MdTranslate size={14} className="text-accent-pink group-hover:scale-110 transition-transform duration-300" />
            <span className="relative z-10 opacity-70 group-hover:opacity-100">
                {t('shared.lang_switch')}
            </span>
        </button>
    );
};

export default LanguageSwitcher;
