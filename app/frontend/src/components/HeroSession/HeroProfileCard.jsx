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
    glowGradient,
    badgeColor,
    borderHover,
    children
}) => {
    return (
        <div className="group relative">
            {/* Glow Effect */}
            <div className={`absolute -inset-0.5 ${glowGradient} rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000`}></div>

            <div className={`relative punk-card-glass rounded-lg p-8 h-full border border-white/10 ${borderHover} transition-all duration-500`}>
                {/* Badge */}
                <div className="flex items-center justify-between mb-6">
                    <span className={`px-3 py-1 ${badgeColor} rounded-full text-[10px] font-mono uppercase tracking-widest`}>
                        {badge}
                    </span>
                    <span className="text-[10px] font-mono text-white/20">{index}</span>
                </div>

                {/* Título */}
                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">
                    <span className={titleColor}>_</span>{title}
                </h3>

                {/* Descrição */}
                <p className="text-white/60 text-sm font-mono leading-relaxed mb-8">
                    <Trans
                        i18nKey={i18nKey}
                        components={{
                            1: <span className="text-accent-green font-bold" />,
                            3: <span className="text-accent-pink font-bold" />
                        }}
                    >
                        {fallbackDesc}
                    </Trans>
                </p>

                {/* Conteúdo Adicional */}
                {children}
            </div>
        </div>
    );
};

export default HeroProfileCard;
