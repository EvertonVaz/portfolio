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
            border: 'border-punk-pink/50 hover:border-punk-pink',
            bg: 'bg-punk-pink/10 group-hover:bg-punk-pink/20',
            text: 'text-punk-pink',
            tagBg: 'bg-punk-pink/5 border-punk-pink/30',
            tagText: 'text-punk-pink',
            hex: 'text-punk-pink/30'
        },
        green: {
            border: 'border-punk-green/50 hover:border-punk-green',
            bg: 'bg-punk-green/10 group-hover:bg-punk-green/20',
            text: 'text-punk-green',
            tagBg: 'bg-punk-green/5 border-punk-green/30',
            tagText: 'text-punk-green',
            hex: 'text-punk-green/30'
        },
        white: {
            border: 'border-white/20 hover:border-white/60',
            bg: 'bg-white/5 group-hover:bg-white/10',
            text: 'text-white/80',
            tagBg: 'bg-white/5 border-white/20',
            tagText: 'text-white/60',
            hex: 'text-white/10'
        }
    };

    // Fallback safely if theme is invalid
    const style = themeClasses[theme] || themeClasses['white'];

    return (
        <div className={`flex-1 w-full max-w-[320px] bg-punk-bg/90 p-6 border-2 ${style.border} transition-all duration-300 group relative overflow-hidden flex flex-col ${highlight ? 'scale-105 z-10 shadow-[0_0_20px_rgba(0,0,0,0.5)]' : ''}`}>
            {hexIndex && (
                <div className={`absolute top-0 right-0 p-2 text-[10px] font-mono ${style.hex} tracking-widest bg-black/50 border-b border-l border-white/5`}>
                    {hexIndex}
                </div>
            )}

            {/* Header: Icon + Title */}
            <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 flex items-center justify-center border-2 ${style.border} ${style.bg} transition-colors`}>
                    <span className={`${style.text} font-black font-mono`}>{iconLabel}</span>
                </div>
                <h4 className="text-lg font-black text-white tracking-tighter uppercase leading-none break-words max-w-[180px]">
                    {title}
                </h4>
            </div>

            {/* Description - Removed fixed height to avoid overlap */}
            <div className="flex-1 mb-6">
                <p className="text-white/60 text-xs font-mono leading-relaxed border-l-2 border-white/10 pl-3">
                    {description}
                </p>
            </div>

            {/* Tags Footer */}
            <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-white/5">
                {tags.map((tag, idx) => (
                    <span
                        key={idx}
                        className={`px-2 py-1 ${style.tagBg} ${style.tagText} text-[10px] font-black uppercase tracking-wider border`}
                    >
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default ArchitectureLayer;
