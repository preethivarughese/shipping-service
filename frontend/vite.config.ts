import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/shipping': 'http://localhost:8082',
      '/incident': 'http://localhost:8082',
      '/actuator': 'http://localhost:8082',
    }
  }
})
