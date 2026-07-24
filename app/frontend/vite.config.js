import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { execSync } from 'child_process'

// Versão exibida em runtime (comando `version` do /terminal): "v<semver> (<sha>)".
// O semver vem do package.json (viaja dentro do commit); o sha vem do SOURCE_COMMIT
// que o Coolify injeta no build. Em dev local o sha cai no git; sem git nem env, some.
// VITE_APP_VERSION sobrescreve tudo (escape hatch, igual PORTFOLIO_VERSION do backend).
function appVersion() {
  if (process.env.VITE_APP_VERSION) return process.env.VITE_APP_VERSION
  const { version } = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))
  let sha = process.env.SOURCE_COMMIT
  if (!sha) {
    try { sha = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim() } catch { sha = '' }
  }
  sha = sha.slice(0, 7)
  return sha ? `v${version} (${sha})` : `v${version}`
}

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
  define: {
    ...loadPongEnv(),
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion()),
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/token': 'http://localhost:4000',
      '/api': 'http://localhost:4000',
      // o backend expõe /ws/minishell e /ws/philosophers
      '/ws': {
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
