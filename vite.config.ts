import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    proxy: {
      "/payments": { target: "http://localhost:8000", changeOrigin: true },
    },
  },
});