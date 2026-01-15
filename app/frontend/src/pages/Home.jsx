import React from 'react'
import { motion } from 'framer-motion'

function Home() {
  return (
    <section className="flex flex-col items-center justify-center p-8 text-center scroll-mt-24">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1 }}
        className="max-w-4xl w-full"
      >
        <div className="flex items-center justify-center  mb-16">
            <span className="h-0.5 flex-1 bg-white opacity-20"></span>
            <p className="text-2xl md:text-3xl font-mono text-accent-green font-bold uppercase tracking-widest">
                born2code
            </p>
            <span className="h-0.5 flex-1 bg-white opacity-20"></span>
        </div>
      </motion.div>
    </section>
  )
}

export default Home
