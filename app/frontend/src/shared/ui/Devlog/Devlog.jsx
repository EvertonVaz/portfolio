import React from 'react';

const THEMES = {
    terminal:     { accent: 'text-punk-green', chip: 'bg-punk-green/10 border-punk-green/20', idx: 'text-punk-green/40' },
    philosophers: { accent: 'text-punk-cyan',  chip: 'bg-punk-cyan/10 border-punk-cyan/20',  idx: 'text-punk-cyan/40' },
    fractals:     { accent: 'text-punk-pink',  chip: 'bg-punk-pink/10 border-punk-pink/20',  idx: 'text-punk-pink/40' },
    pong:         { accent: 'text-punk-cyan',  chip: 'bg-punk-cyan/10 border-punk-cyan/20',  idx: 'text-punk-cyan/40' },
};

/**
 * Devlog - seção narrativa reutilizável: kicker + título + subtítulo + beats numerados.
 * O conteúdo (textos e visuais) vem pronto de quem usa, então serve qualquer página.
 *
 * @param {'terminal'|'philosophers'|'fractals'|'pong'} theme - cor de destaque
 * @param {string} kicker - rótulo pequeno (ex: "devlog")
 * @param {string} title - título da seção
 * @param {string} subtitle - subtítulo/hook
 * @param {{title:string, body:string, visual?:React.ReactNode}[]} beats - passos numerados
 */
export default function Devlog({ theme = 'terminal', kicker, title, subtitle, beats = [] }) {
    const c = THEMES[theme] || THEMES.terminal;

    return (
        <div className="mt-24 mb-6">
            {/* header */}
            <div className="max-w-3xl mx-auto text-center mb-14">
                {kicker && (
                    <div className={`inline-block px-3 py-1 border rounded-full mb-4 ${c.chip}`}>
                        <span className={`text-[10px] font-mono uppercase tracking-[0.2em] ${c.accent}`}>
                            {kicker}
                        </span>
                    </div>
                )}
                <h3 className="text-3xl font-bold text-white mb-4 uppercase tracking-tighter">{title}</h3>
                {subtitle && (
                    <p className="text-white/50 font-mono text-xs italic max-w-lg mx-auto">{subtitle}</p>
                )}
            </div>

            {/* beats numerados */}
            <div className="max-w-3xl mx-auto flex flex-col gap-12">
                {beats.map((b, i) => (
                    <div key={i} className="flex gap-4 md:gap-6">
                        <div className={`shrink-0 font-mono text-sm pt-1 tabular-nums select-none ${c.idx}`}>
                            {String(i + 1).padStart(2, '0')}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col gap-4 border-l border-white/10 pl-4 md:pl-6">
                            <h4 className="font-black uppercase tracking-tight text-white text-lg leading-none">
                                {b.title}
                            </h4>
                            <p className="text-white/60 text-sm leading-relaxed">{b.body}</p>
                            {b.visual}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
