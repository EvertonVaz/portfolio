import { useTranslation } from 'react-i18next';

/**
 * HeroInterestsTerminal - Terminal visual de interesses (SRP).
 * Exibe áreas de interesse em formato de terminal.
 */
const HeroInterestsTerminal = () => {
    const { t } = useTranslation();

    const interests = [
        { color: 'text-punk-green', text: t('hero.interest_1') },
        { color: 'text-punk-pink', text: t('hero.interest_2') },
        { color: 'text-punk-cyan', text: t('hero.interest_3') },
    ];

    return (
        <div className="w-full max-w-5xl mx-auto mt-8 px-4 lg:px-0">
            {/* Brutalist Terminal Container */}
            <div className="bg-punk-gray/80 border-2 border-white/20 p-2 font-mono text-sm shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-[8px_8px_0px_0px_rgba(57,255,20,0.5)] transition-shadow duration-300">
                {/* Header do Terminal */}
                <div className="flex items-center justify-between bg-black/50 p-2 mb-4 border-b border-white/10">
                    <span className="text-white/50 text-xs tracking-widest uppercase"> user@portfolio:~/interests </span>
                    <div className="flex gap-2">
                        <span className="w-3 h-3 bg-punk-pink/50 border border-punk-pink/30 hover:bg-punk-pink cursor-pointer transition-colors"></span>
                        <span className="w-3 h-3 bg-punk-cyan/50 border border-punk-cyan/30 hover:bg-punk-cyan cursor-pointer transition-colors"></span>
                        <span className="w-3 h-3 bg-punk-green/50 border border-punk-green/30 hover:bg-punk-green cursor-pointer transition-colors"></span>
                    </div>
                </div>

                {/* Conteúdo */}
                <div className="p-4 flex flex-col md:flex-row md:justify-around gap-6">
                    {interests.map((interest, idx) => (
                        <div key={idx} className="flex items-center gap-3 group">
                            <span className={`${interest.color} text-base md:text-lg group-hover:scale-125 transition-transform duration-300`}>&gt;</span>
                            <span className="text-white/80 group-hover:text-white transition-colors">{interest.text}</span>
                        </div>
                    ))}
                </div>

                {/* Command Line Input Simulation */}
                <div className="px-4 pb-2 text-xs text-white/30 animate-pulse">
                    _ cursor_active
                </div>
            </div>
        </div>
    );
};

export default HeroInterestsTerminal;
