import React from 'react'
import { motion } from 'framer-motion'
import HeroBanner from '../components/home/HeroBanner'
import ProfileDescription from '../components/home/ProfileDescription'

/**
 * Página Inicial (Home).
 * Refatorada para orquestrar componentes especializados.
 */
function Home() {
  return (
    <section className="flex flex-col items-center justify-center p-8 text-center scroll-mt-24 min-h-[80vh]">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1 }}
        className="max-w-4xl w-full"
      >
        <HeroBanner />
        <ProfileDescription />
      </motion.div>
    </section>
  )
}

export default Home
