import { useTranslation } from 'react-i18next';

/**
 * HeroInterestsTerminal - Terminal visual de interesses (SRP).
 * Exibe áreas de interesse em formato de terminal.
 */
const HeroInterestsTerminal = () => {
    const { t } = useTranslation();

    const interests = [
        { color: 'text-accent-green', text: t('hero.interest_1') },
        { color: 'text-accent-pink', text: t('hero.interest_2') },
        { color: 'text-accent-blue', text: t('hero.interest_3') },
    ];

    return (
        <div className="w-full max-w-5xl mx-auto mt-8">
            <div className="bg-black/40 rounded-lg border border-white/10 p-6 font-mono text-sm backdrop-blur-sm">
                {/* Header do Terminal */}
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
                    <span className="w-3 h-3 rounded-full bg-red-500/70"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500/70"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500/70"></span>
                    <span className="ml-3 text-white/30 text-xs">~/interests.sh</span>
                </div>

                {/* Conteúdo */}
                <div className="flex flex-col md:flex-row md:justify-around gap-4">
                    {interests.map((interest, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <span className={`${interest.color} text-lg`}>→</span>
                            <span className="text-white/70">{interest.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HeroInterestsTerminal;
