import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ScrollSection from './components/shared/ScrollSection'
import Home from './pages/Home'
import TerminalPage from './pages/TerminalPage'
import WorkPage from './pages/WorkPage'
import ContactPage from './pages/ContactPage'

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
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
