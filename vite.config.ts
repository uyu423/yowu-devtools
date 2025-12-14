import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { generateRoutes } from './vite-plugin-generate-routes'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), generateRoutes()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
