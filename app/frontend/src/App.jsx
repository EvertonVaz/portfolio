import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { motion } from 'framer-motion'
import Layout from './components/Layout'
import Home from './pages/Home'
import TerminalPage from './pages/TerminalPage'
import WorkPage from './pages/WorkPage'
import HacklogPage from './pages/HacklogPage'
import ContactPage from './pages/ContactPage'

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

function App() {
  return (
    <Router>
      <Layout>
        <ScrollSection id="home">
          <Home />
        </ScrollSection>

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
      </Layout>
    </Router>
  )
}

export default App
