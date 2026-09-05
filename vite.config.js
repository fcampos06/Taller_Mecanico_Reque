import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// base relativa: la build funciona aunque se publique dentro de una subcarpeta
// (GitHub Pages, hosting académico, servidor estático, etc.).
export default defineConfig({
  base: './',
  plugins: [vue()],
})
