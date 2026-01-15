import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import TerminalPage from './pages/TerminalPage'
import WorkPage from './pages/WorkPage'
import HacklogPage from './pages/HacklogPage'
import ContactPage from './pages/ContactPage'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/terminal" element={<TerminalPage />} />
          <Route path="/work" element={<WorkPage />} />
          <Route path="/hacklog" element={<HacklogPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
