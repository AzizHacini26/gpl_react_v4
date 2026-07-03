import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:18085',
        changeOrigin: true,
      },
      '/authenticate': {
        target: 'http://localhost:18085',
        changeOrigin: true,
      },
      '/register': {
        target: 'http://localhost:18085',
        changeOrigin: true,
      },
    },
  },
})
