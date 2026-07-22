import React from 'react';
import { Trans } from 'react-i18next';

/**
 * HeroProfileCard - Componente de card de perfil reutilizável (SRP).
 * @param {string} badge - Texto do badge superior
 * @param {string} index - Número do card (01, 02)
 * @param {string} title - Título do card
 * @param {string} titleColor - Cor do destaque no título
 * @param {string} i18nKey - Chave de tradução da descrição
 * @param {string} fallbackDesc - Descrição fallback
 * @param {string} glowGradient - Classes do gradiente de glow
 * @param {string} badgeColor - Classes de cor do badge
 * @param {string} borderHover - Classe de hover da borda
 * @param {React.ReactNode} children - Conteúdo adicional (stats, etc)
 */
const HeroProfileCard = ({
    badge,
    index,
    title,
    titleColor,
    i18nKey,
    fallbackDesc,
    badgeColor,
    borderHover,
    children
}) => {
    return (
        <div className="group relative h-full">
            {/* Brutalist Shadow/Glow (Offset) */}
            <div className={`absolute top-2 left-2 w-full h-full border border-white/10 bg-punk-gray/50 -z-10 transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1`}></div>

            {/* Main Card Container */}
            <div className={`relative bg-punk-bg/90 p-6 md:p-8 h-full border-2 border-white/20 hover:border-white transition-all duration-300 ${borderHover}`}>
                {/* Badge */}
                <div className="flex items-center justify-between mb-6">
                    <span className={`px-2 py-1 ${badgeColor} text-[10px] font-mono uppercase tracking-widest border border-current`}>
                        {badge}
                    </span>
                    <span className="text-[10px] font-mono text-white/20">//{index}</span>
                </div>

                {/* Título */}
                <h3 className="text-xl md:text-2xl font-black text-white mb-4 tracking-tight uppercase">
                    <span className={`mr-2 ${titleColor}`}>&gt;</span>{title}
                </h3>

                {/* Descrição */}
                <p className="text-white/60 text-sm font-mono leading-relaxed mb-8 border-l-2 border-white/10 pl-4">
                    <Trans
                        i18nKey={i18nKey}
                        components={{
                            1: <span className="text-punk-green font-bold" />,
                            3: <span className="text-punk-pink font-bold" />
                        }}
                    >
                        {fallbackDesc}
                    </Trans>
                </p>

                {/* Conteúdo Adicional */}
                <div className="mt-auto">
                    {children}
                </div>

                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/40"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/40"></div>
            </div>
        </div>
    );
};

export default HeroProfileCard;
