import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // Use '/' on Vercel or in development, but keep the subpath for GH Pages
  base: mode === 'production' && !process.env.VERCEL ? '/VoltMap_India_frontend/' : '/',
  plugins: [react()],
}))
