import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite' // ★追加

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    tailwindcss(), // ★追加
  ],
})
