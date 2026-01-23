import React from 'react';

/**
 * ArchitectureConnector - Componente de conexão entre camadas.
 *
 * @param {string} label - Texto descrevendo o tipo de comunicação
 * @param {'pink-green' | 'green-white'} gradient - Direção das cores do gradiente
 * @param {boolean} active - Se verdadeiro, mostra o pulso de dados animado
 */
const ArchitectureConnector = ({ label, gradient = 'pink-green', active = true }) => {
    const gradients = {
        'pink-green': 'from-accent-pink to-accent-green',
        'green-white': 'from-accent-green to-white/20'
    };

    const pulseColor = gradient === 'pink-green' ? 'bg-accent-green shadow-[0_0_10px_#4ade80]' : 'bg-white/40 shadow-[0_0_8px_rgba(255,255,255,0.3)]';

    return (
        <div className="flex flex-row md:flex-col items-center justify-center gap-4 py-4 md:py-0">
            {label && (
                <div className="text-[9px] font-mono text-white/20 uppercase tracking-widest hidden lg:block font-bold" style={{ writingMode: 'vertical-rl' }}>
                    {label}
                </div>
            )}
            <div className={`h-[2px] w-12 md:h-12 md:w-[2px] bg-gradient-to-r md:bg-gradient-to-b ${gradients[gradient]} relative`}>
                {active && (
                    <div className={`absolute -right-1 md:-bottom-1 md:-left-1 w-2 h-2 rounded-full ${pulseColor} animate-pulse`}></div>
                )}
            </div>
        </div>
    );
};

export default ArchitectureConnector;
