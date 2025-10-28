import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // or "0.0.0.0" to accept external connections
  },
  preview: {
    allowedHosts: ['eventsease.app', 'www.eventsease.app'],
  },
})
