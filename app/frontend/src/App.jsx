import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './shared/ui/layout/Layout'
import ScrollSection from './shared/ui/ScrollSection'
import Home from './modules/home/pages/Home'
import TerminalPage from './modules/terminal/pages/TerminalPage'
import FractalPage from './modules/fractal/pages/FractalPage'
import WorkPage from './modules/portfolio/pages/WorkPage'
import ContactPage from './modules/portfolio/pages/ContactPage'
import PhilosophersPage from './modules/philosophers/pages/PhilosophersPage'
import PongPage from './modules/pong/pages/PongPage'
import PongTrainingPage from './modules/pong/pages/PongTrainingPage'
import ScrollToTop from './shared/ui/ScrollToTop'

/**
 * Componente Principal da Aplicação.
 * SRP: Gerencia apenas as rotas e a estrutura do layout.
 */
function App() {
  return (
    <Router>
      <ScrollToTop />
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
          <Route path="/home" element={<Navigate to="/#home" replace />} />
          <Route path="/work" element={<Navigate to="/#work" replace />} />
          <Route path="/contact" element={<Navigate to="/#contact" replace />} />
          <Route path="/terminal" element={<TerminalPage />} />
          <Route path="/fractals" element={<FractalPage />} />
          <Route path="/philosophers" element={<PhilosophersPage />} />
          <Route path="/pong" element={<PongPage />} />
          <Route path="/pong/training" element={<PongTrainingPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
