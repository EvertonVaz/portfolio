import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './shared/ui/layout/Layout'
import ScrollSection from './shared/ui/ScrollSection'
import ScrollToTop from './shared/ui/ScrollToTop'

// Rotas de "/" carregam eager (renderizam no primeiro paint)
import Home from './modules/home/pages/Home'
import WorkPage from './modules/portfolio/pages/WorkPage'
import ContactPage from './modules/portfolio/pages/ContactPage'

// Rotas fora de "/" sob demanda (code splitting): cada uma vira um chunk
// próprio, tirando phoenix e as árvores das demos do bundle inicial.
const JourneyPage = lazy(() => import('./modules/journey/pages/JourneyPage'))
const LabsPage = lazy(() => import('./modules/labs/pages/LabsPage'))
const TerminalPage = lazy(() => import('./modules/terminal/pages/TerminalPage'))
const FractalPage = lazy(() => import('./modules/fractal/pages/FractalPage'))
const PhilosophersPage = lazy(() => import('./modules/philosophers/pages/PhilosophersPage'))
const PongPage = lazy(() => import('./modules/pong/pages/PongPage'))

// Página de treino só existe em dev (depende do make train-server);
// fora do bundle de produção via dead-code elimination
const PongTrainingPage = import.meta.env.DEV
  ? lazy(() => import('./modules/pong/pages/PongTrainingPage'))
  : null

/**
 * Componente Principal da Aplicação.
 * SRP: Gerencia apenas as rotas e a estrutura do layout.
 */
function App() {
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Suspense fallback={null}>
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
            <Route path="/pong/training" element={<PongTrainingPage />} />
          )}
        </Routes>
        </Suspense>
      </Layout>
    </Router>
  )
}

export default App
