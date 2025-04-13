import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      external: [], // Explicitly empty to ensure no unintended externalization
    }
  },
  resolve: {
    alias: {
      'lucide-react': 'lucide-react' // Explicit resolution for lucide-react
    }
  },
  server: {
    port: 5173
  }
})