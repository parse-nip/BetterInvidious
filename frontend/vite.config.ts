import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
      '/latest_version': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
      '/companion': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
      '/vi': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
      '/ggpht': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
      '/login': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
      '/signout': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
      '/toggle_theme': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
      '/preferences': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  },
})
