import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation, Trans } from 'react-i18next'
import HeroCards from '../components/HeroCards'

function Home() {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col items-center justify-center p-8 text-center scroll-mt-24 min-h-[80vh]">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1 }}
        className="max-w-4xl w-full"
      >
        <span className=' text-white/10'>{t('hero.under_construction')}</span>
        <div className="flex items-center justify-center mb-12">
          <span className="h-0.5 flex-1 bg-white opacity-20"></span>
          <p className="text-2xl md:text-3xl font-mono text-accent-green font-bold uppercase tracking-widest px-4">
            {t('hero.born2code')}
          </p>
          <span className="h-0.5 flex-1 bg-white opacity-20"></span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter uppercase">
          Everton Vaz
        </h1>

        <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-12 font-mono leading-relaxed">
          <Trans i18nKey="hero.description">
            Engenheiro de Software apaixonado por sistemas complexos, <span className="text-accent-pink font-bold italic">fractais</span> e a
            estética da cultura <span className="text-accent-green font-bold">indie</span>. Ex-empreendedor com olhar pragmático e curioso,
            explorando a interseção entre tecnologia, ciência e filosofia para construir soluções de impacto.
          </Trans>
        </p>

      </motion.div>
    </section>
  )
}

export default Home
