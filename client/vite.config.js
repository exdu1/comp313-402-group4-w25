import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  preview: {
    port: 4173,
    host: true
  },
  // Explicitly set the base directory for production
  base: '/',
  // For environment variable handling
  define: {
    'process.env': {}
  }
})