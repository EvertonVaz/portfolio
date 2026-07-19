import React from 'react';

/**
 * CodeBlock - bloco de código estilizado com chip do nome do arquivo.
 *
 * @param {string} file - nome do arquivo exibido no chip
 * @param {string} accent - classe de cor do ponto (ex: 'bg-punk-pink/60')
 * @param {React.ReactNode} children - o código (string em <pre>)
 */
export default function CodeBlock({ file, accent = 'bg-punk-cyan/60', children }) {
    return (
        <div className="border border-white/10 bg-black/40 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/10 bg-white/5">
                <span className={`w-2 h-2 rounded-full ${accent}`} />
                <span className="font-mono text-[10px] text-white/40 tracking-widest">{file}</span>
            </div>
            <pre className="p-4 overflow-x-auto font-mono text-[11px] leading-relaxed text-white/70">
                <code>{children}</code>
            </pre>
        </div>
    );
}
