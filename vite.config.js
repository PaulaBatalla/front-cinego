import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        configure(proxy) {
          proxy.on('proxyReq', (proxyReq) => {
            // El navegador llama al mismo origen; el proxy representa esa llamada ante el backend.
            if (proxyReq.getHeader('origin')) {
              proxyReq.setHeader('origin', 'http://localhost:8080')
            }
          })
        },
      },
    },
  },
})
