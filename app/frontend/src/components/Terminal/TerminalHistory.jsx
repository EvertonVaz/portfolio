import React from 'react';

/**
 * Componente que renderiza as linhas do histórico do terminal.
 * Segue o SRP (Single Responsibility Principle).
 */
const TerminalHistory = ({ lines }) => {
    return (
        <div className="terminal-history">
            {lines.map((line, i) => (
                <div key={i} className="mb-1 leading-relaxed">
                    {line.type === 'input' ? (
                        <div className="flex gap-2">
                            <span className="text-accent-pink font-bold">$</span>
                            <span className="text-white font-mono">{line.content}</span>
                        </div>
                    ) : (
                        <div className="text-accent-green font-mono whitespace-pre-wrap">
                            {line.content}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default TerminalHistory;
