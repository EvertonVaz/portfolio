import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
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
      }
    }
  }
})
