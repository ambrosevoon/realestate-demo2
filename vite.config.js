import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/webhook': {
        target: 'https://n8n.srv823907.hstgr.cloud',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})
