import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: 'src/web',
  plugins: [react()],
  server: {
    proxy: {
      '/api/ollama': {
        target: 'http://127.0.0.1:11434',
        rewrite: (path) => path.replace(/^\/api\/ollama/, ''),
      },
    },
  },
  build: { outDir: '../../dist-web', emptyOutDir: true }
})
