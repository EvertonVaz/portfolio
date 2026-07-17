import { lazy, Suspense } from 'react'
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

// Página de treino só existe em dev (depende do make train-server);
// fora do bundle de produção via dead-code elimination
const PongTrainingPage = import.meta.env.DEV
  ? lazy(() => import('./modules/pong/pages/PongTrainingPage'))
  : null
import JourneyPage from './modules/journey/pages/JourneyPage'
import LabsPage from './modules/labs/pages/LabsPage'
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
          <Route path="/journey" element={<JourneyPage />} />
          <Route path="/labs" element={<LabsPage />} />
          <Route path="/terminal" element={<TerminalPage />} />
          <Route path="/fractals" element={<FractalPage />} />
          <Route path="/philosophers" element={<PhilosophersPage />} />
          <Route path="/pong" element={<PongPage />} />
          {import.meta.env.DEV && (
            <Route
              path="/pong/training"
              element={
                <Suspense fallback={null}>
                  <PongTrainingPage />
                </Suspense>
              }
            />
          )}
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
