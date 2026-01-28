import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tailwind.css'
import './i18n'
import App from './App.jsx'


if (import.meta.env.PROD) {
  console.log = () => { };
  console.info = () => { };
  console.debug = () => { };
  console.warn = () => { };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
