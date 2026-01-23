import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import HeroProfileCard from './HeroProfileCard';
import HeroInterestsTerminal from './HeroInterestsTerminal';

/**
 * HeroCards - Orquestrador dos cards de perfil (Composição SOLID).
 */
const HeroCards = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      {/* Grid de Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Card Esquerdo: Perfil Criativo */}
        <HeroProfileCard
          badge="creative_profile"
          index="01"
          title="soul.config"
          titleColor="text-punk-pink"
          i18nKey="hero.description"
          fallbackDesc="Engenheiro de Software apaixonado por sistemas complexos, a música por trás do código e a estética indie."
          glowGradient="bg-punk-pink"
          badgeColor="text-punk-pink border-punk-pink/50"
          borderHover="hover:border-punk-pink"
        >
          {/* Creative Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 border-dashed">
            <div className="text-center group-hover:translate-y-[-2px] transition-transform duration-300">
              <span className="block text-2xl font-black text-punk-pink">{t('hero.stat_phi')}</span>
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">{t('hero.stat_aesthetics')}</span>
            </div>
            <div className="text-center group-hover:translate-y-[-2px] transition-transform duration-300 delay-75">
              <span className="block text-2xl font-black text-white">{t('hero.stat_diy')}</span>
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">{t('hero.stat_mindset')}</span>
            </div>
            <div className="text-center group-hover:translate-y-[-2px] transition-transform duration-300 delay-100">
              <span className="block text-2xl font-black text-punk-cyan">{t('hero.stat_freq')}</span>
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">{t('hero.stat_resonance')}</span>
            </div>
          </div>
        </HeroProfileCard>

        {/* Card Direito: Perfil Técnico */}
        <HeroProfileCard
          badge="professional_profile"
          index="02"
          title="career.log"
          titleColor="text-punk-green"
          i18nKey="hero.professional_desc"
          fallbackDesc="Desenvolvedor backend."
          glowGradient="bg-punk-green"
          badgeColor="text-punk-green border-punk-green/50"
          borderHover="hover:border-punk-green"
        >
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 border-dashed">
            <div className="text-center group-hover:translate-y-[-2px] transition-transform duration-300">
              <span className="block text-2xl font-black text-punk-green">7+</span>
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">anos exp</span>
            </div>
            <div className="text-center group-hover:translate-y-[-2px] transition-transform duration-300 delay-75">
              <span className="block text-2xl font-black text-white">42</span>
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">são paulo</span>
            </div>
            <div className="text-center group-hover:translate-y-[-2px] transition-transform duration-300 delay-100">
              <span className="block text-2xl font-black text-punk-cyan">∞</span>
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">curiosidade</span>
            </div>
          </div>
        </HeroProfileCard>

      </div>

      {/* Terminal de Interesses - Abaixo dos Cards */}
      <HeroInterestsTerminal />
    </div>
  );
};

export default HeroCards;
