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
          titleColor="text-accent-pink"
          i18nKey="hero.description"
          fallbackDesc="Engenheiro de Software apaixonado por sistemas complexos, a música por trás do código e a estética indie."
          glowGradient="bg-gradient-to-r from-accent-pink to-accent-blue"
          badgeColor="bg-accent-pink/10 border border-accent-pink/20 text-accent-pink"
          borderHover="hover:border-accent-pink/50"
        >
          {/* Creative Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
            <div className="text-center">
              <span className="block text-2xl font-bold text-accent-pink">{t('hero.stat_phi')}</span>
              <span className="text-[10px] font-mono text-white/40 uppercase">{t('hero.stat_aesthetics')}</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-white">{t('hero.stat_diy')}</span>
              <span className="text-[10px] font-mono text-white/40 uppercase">{t('hero.stat_mindset')}</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-accent-blue">{t('hero.stat_freq')}</span>
              <span className="text-[10px] font-mono text-white/40 uppercase">{t('hero.stat_resonance')}</span>
            </div>
          </div>
        </HeroProfileCard>

        {/* Card Direito: Perfil Técnico */}
        <HeroProfileCard
          badge="professional_profile"
          index="02"
          title="career.log"
          titleColor="text-accent-green"
          i18nKey="hero.professional_desc"
          fallbackDesc="Desenvolvedor backend."
          glowGradient="bg-gradient-to-r from-accent-green to-accent-blue"
          badgeColor="bg-accent-green/10 border border-accent-green/20 text-accent-green"
          borderHover="hover:border-accent-green/50"
        >
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
            <div className="text-center">
              <span className="block text-2xl font-bold text-accent-green">7+</span>
              <span className="text-[10px] font-mono text-white/40 uppercase">anos exp</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-white">42</span>
              <span className="text-[10px] font-mono text-white/40 uppercase">são paulo</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-accent-blue">∞</span>
              <span className="text-[10px] font-mono text-white/40 uppercase">curiosidade</span>
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
