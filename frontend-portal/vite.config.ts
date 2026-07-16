import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5175,
    strictPort: true,
    host: true,
    // Proxy API calls through this same origin so the phone (or an ngrok
    // tunnel) only ever needs to reach this one HTTPS URL — the backend
    // itself never needs to be separately exposed.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
    allowedHosts: true,
  },
})
