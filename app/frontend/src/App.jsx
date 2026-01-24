import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './shared/ui/layout/Layout'
import ScrollSection from './shared/ui/ScrollSection'
import Home from './modules/home/pages/Home'
import TerminalPage from './modules/terminal/pages/TerminalPage'
import FractalPage from './modules/fractal/pages/FractalPage'
import WorkPage from './modules/portfolio/pages/WorkPage'
import ContactPage from './modules/portfolio/pages/ContactPage'
import PhilosophersPage from './modules/philosophers/pages/PhilosophersPage'

/**
 * Componente Principal da Aplicação.
 * SRP: Gerencia apenas as rotas e a estrutura do layout.
 */
function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={
            <>
              <ScrollSection id="home">
                <Home />
              </ScrollSection>

              <ScrollSection id="work">
                <WorkPage />
              </ScrollSection>

              <ScrollSection id="contact">
                <ContactPage />
              </ScrollSection>
            </>
          } />
          <Route path="/terminal" element={<TerminalPage />} />
          <Route path="/fractals" element={<FractalPage />} />
          <Route path="/philosophers" element={<PhilosophersPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
