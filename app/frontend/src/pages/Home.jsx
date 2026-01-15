import React from 'react'
import { motion } from 'framer-motion'
import TerminalPage from './TerminalPage'
import WorkPage from './WorkPage'
import HacklogPage from './HacklogPage'
import ContactPage from './ContactPage'
import HeroCards from '../components/HeroCards'

const ScrollSection = ({ children, id }) => (
  <motion.div
    id={id}
    initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className="flex flex-col justify-center scroll-mt-24"
  >
    {children}
  </motion.div>
)

function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section id="home" className="flex flex-col items-center justify-center p-8 text-center scroll-mt-24">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          className="max-w-4xl w-full"
        >
          <div className="flex items-center justify-center gap-6 mb-16">
            <span className="h-[2px] flex-1 bg-white opacity-20"></span>
            <p className="text-2xl md:text-3xl font-mono text-accent-green font-bold uppercase tracking-widest">
              born2code
            </p>
            <span className="h-[2px] flex-1 bg-white opacity-20"></span>
          </div>

          {/* <HeroCards /> */}
        </motion.div>
      </section>

      <ScrollSection id="terminal">
        <TerminalPage />
      </ScrollSection>

      {/* <ScrollSection id="work">
        <WorkPage />
      </ScrollSection>

      <ScrollSection id="hacklog">
        <HacklogPage />
      </ScrollSection> */}

      <ScrollSection id="contact">
        <ContactPage />
      </ScrollSection>
    </div>
  )
}

export default Home
