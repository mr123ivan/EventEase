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
        host: '0.0.0.0',
        allowedHosts: [
            'eventsease.app',
            'www.eventsease.app',
            '.ngrok-free.app',
        ],
    },
    preview: {
        host: '0.0.0.0',
        allowedHosts: [
            'eventsease.app',
            'www.eventsease.app',
            '.ngrok-free.app',
        ],
    },
})
