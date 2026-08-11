import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createMistralProxyMiddleware } from './src/server/mistral-proxy'

export default defineConfig({
  root: 'src/web',
  plugins: [react(), {
    name: 'focus-companion-mistral-proxy',
    configureServer(server) {
      server.middlewares.use(createMistralProxyMiddleware(process.env.ADHD_APP_MISTRAL_API_KEY))
    },
  }],
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
