import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * HeroBanner - Cabeçalho compacto e impactante com estética Cyberpunk/Brutalist.
 */
const HeroBanner = () => {
    const { t } = useTranslation();
    const [typedText, setTypedText] = useState('');
    const fullText = t('hero.born2code');

    // Typewriter Effect
    useEffect(() => {
        let index = 0;
        const typeInterval = setInterval(() => {
            setTypedText(fullText.substring(0, index + 1));
            index++;
            if (index > fullText.length) clearInterval(typeInterval);
        }, 150);
        return () => clearInterval(typeInterval);
    }, [fullText]);

    return (
        <div className="mb-12 md:mb-24 text-center select-none pt-12 md:pt-0">
            {/* Nome Principal - Glitch Effect (React Layered) */}
            <div className="relative inline-block group px-4">
                {/* Layer Red/Pink */}
                <h1 className="absolute top-0 left-0 w-full text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter uppercase text-punk-pink opacity-0 group-hover:opacity-100 group-hover:translate-x-[2px] transition-all duration-100 pointer-events-none select-none z-0 mix-blend-screen">
                    Everton Vaz
                </h1>
                {/* Layer Cyan */}
                <h1 className="absolute top-0 left-0 w-full text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter uppercase text-punk-cyan opacity-0 group-hover:opacity-100 group-hover:-translate-x-[2px] transition-all duration-100 delay-75 pointer-events-none select-none z-0 mix-blend-screen">
                    Everton Vaz
                </h1>
                {/* Main Layer */}
                <h1 className="relative z-10 text-5xl sm:text-6xl md:text-8xl font-black mb-4 tracking-tighter uppercase text-white bg-clip-text hover:text-white/90 transition-colors break-words">
                    Everton Vaz
                </h1>
            </div>

            {/* Role Badge - Typewriter */}
            <div className="flex items-center justify-center gap-4 mt-4 h-8">
                <span className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-punk-green/50"></span>
                <span className="text-lg md:text-xl font-mono text-punk-green font-bold uppercase tracking-widest">
                    <span className="animate-pulse">{typedText}</span>
                </span>
                <span className="h-px flex-1 max-w-[60px] bg-gradient-to-l from-transparent to-punk-green/50"></span>
            </div>
        </div>
    );
};

export default HeroBanner;
