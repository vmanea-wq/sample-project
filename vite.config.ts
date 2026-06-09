import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set BASE_PATH=/repo-name/ in CI when deploying to GitHub Pages project sites.
  base: process.env.BASE_PATH || '/',
})
