import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'fs'
import { resolve } from 'path'

function loadPongEnv() {
  try {
    const raw = readFileSync(resolve(__dirname, '../../envs/.env.pong'), 'utf-8')
    return Object.fromEntries(
      raw.split('\n')
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('#') && l.includes('='))
        .map(l => { const [k, ...v] = l.split('='); return [k.trim(), v.join('=').trim()] })
        .map(([k, v]) => [`import.meta.env.VITE_${k}`, JSON.stringify(v)])
    )
  } catch { return {} }
}

export default defineConfig({
  define: loadPongEnv(),
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/token': 'http://localhost:4000',
      '/minishell': {
        target: 'http://localhost:4000',
        ws: true,
        changeOrigin: true
      },
      '/philosophers': {
        target: 'http://localhost:4000',
        ws: true,
        changeOrigin: true
      },
      '/socket': {
        target: 'http://localhost:4000',
        ws: true,
        changeOrigin: true
      },
      '/train-api': {
        target: 'http://localhost:4001',
        rewrite: path => path.replace(/^\/train-api/, ''),
        changeOrigin: true,
      }
    }
  }
})
