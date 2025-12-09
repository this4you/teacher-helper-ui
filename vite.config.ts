import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/teacher-helper-ui/',
  build: {
    rollupOptions: {
      output: {
        dir: 'dist',
        entryFileNames: 'teacher-helper-ui.js'
      }
    }
  },
  plugins: [react()],
})
