import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/users': 'http://localhost:3000',
      '/projects': 'http://localhost:3000',
    },
  },
})
