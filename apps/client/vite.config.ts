import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    tailwindcss(),
  ],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:3000',
        changeOrigin: true,
      },
      '/yjs': {
        target: process.env.VITE_YJS_PROXY_TARGET ?? 'ws://localhost:1234',
        ws: true,
        rewrite: (path) => path.replace(/^\/yjs/, ''),
      },
      '/grafana': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/grafana/, ''),
      },
    },
  },
})
