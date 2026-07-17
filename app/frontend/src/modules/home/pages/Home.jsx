import React from 'react'
import { motion } from 'framer-motion'
import HeroBanner from '../components/HeroSession/HeroBanner'
import HeroCards from '../components/HeroSession/HeroCards'
import HomeTeasers from '../components/HeroSession/HomeTeasers'

/**
 * Página Inicial (Home) - Redesign "Terminal Identity".
 */
function Home() {
  return (
    <section className="flex flex-col items-center justify-center px-4 py-16 md:py-24 text-center scroll-mt-24 min-h-[90vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full"
      >
        <HeroBanner />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="w-full"
      >
        <HeroCards />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="w-full"
      >
        <HomeTeasers />
      </motion.div>
    </section>
  )
}

export default Home
