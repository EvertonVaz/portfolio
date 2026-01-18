import React from 'react';

/**
 * ArchitectureLayer - Componente visual para uma camada de diagrama.
 *
 * @param {string} title - Título da camada
 * @param {string} description - Descrição curta
 * @param {string} iconLabel - Sigla ou label no ícone (ex: FE, BFF)
 * @param {string[]} tags - Lista de tecnologias/tags
 * @param {string} hexIndex - Identificador hexadecimal (ex: 0x01)
 * @param {'pink' | 'green' | 'white'} theme - Tema de cores
 * @param {boolean} highlight - Ativa um destaque visual (escala 105)
 */
const ArchitectureLayer = ({
    title,
    description,
    iconLabel,
    tags = [],
    hexIndex,
    theme = 'white',
    highlight = false
}) => {
    const themeClasses = {
        pink: {
            border: 'border-accent-pink/20 hover:border-accent-pink/40',
            bg: 'bg-accent-pink/10 group-hover:bg-accent-pink/20',
            text: 'text-accent-pink',
            tagBg: 'bg-accent-pink/5 border-accent-pink/10',
            tagText: 'text-accent-pink/70',
            hex: 'text-accent-pink/20'
        },
        green: {
            border: 'border-accent-green/20 hover:border-accent-green/40',
            bg: 'bg-accent-green/10 group-hover:bg-accent-green/20',
            text: 'text-accent-green',
            tagBg: 'bg-accent-green/5 border-accent-green/10',
            tagText: 'text-accent-green/70',
            hex: 'text-accent-green/20'
        },
        white: {
            border: 'border-white/5 hover:border-white/20',
            bg: 'bg-white/5 group-hover:bg-white/10',
            text: 'text-white/60',
            tagBg: 'bg-white/5 border-white/10',
            tagText: 'text-white/40',
            hex: 'text-white/5'
        }
    };

    const style = themeClasses[theme];

    return (
        <div className={`flex-1 w-full max-w-[320px] punk-card-glass p-8 border ${style.border} transition-all duration-500 group relative overflow-hidden ${highlight ? 'scale-105 z-10' : ''}`}>
            {hexIndex && (
                <div className={`absolute top-0 right-0 p-2 text-[8px] font-mono ${style.hex} rotate-90`}>
                    {hexIndex}
                </div>
            )}
            <div className={`w-10 h-10 rounded ${style.bg} flex items-center justify-center border ${style.border} mb-6 transition-colors`}>
                <span className={`${style.text} font-bold`}>{iconLabel}</span>
            </div>
            <h4 className="text-xl font-bold text-white mb-4 tracking-tight uppercase">
                {title}
            </h4>
            <p className="text-white/60 text-sm leading-relaxed mb-6 h-12">
                {description}
            </p>
            <div className="flex flex-wrap gap-2">
                {tags.map((tag, idx) => (
                    <span
                        key={idx}
                        className={`px-2 py-0.5 ${style.tagBg} ${style.tagText} text-[9px] font-mono border`}
                    >
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default ArchitectureLayer;
