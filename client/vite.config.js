import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  return {
    plugins: [react()],
    base: mode === 'production' ? '/' : '/',
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    server: {
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})