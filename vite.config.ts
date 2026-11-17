import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Base path para el proyecto de GitHub Pages: https://waltermolares68-lan.github.io/walter-molares/
  base: '/walter-molares/',
  plugins: [react()],
})
