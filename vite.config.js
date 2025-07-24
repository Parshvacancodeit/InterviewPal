import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../backend/client', // ⚠️ Vite will build React into Flask folder
    emptyOutDir: true
  }
})

