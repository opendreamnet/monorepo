import path from 'path'
import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  // Global CSS
  css: [
    'tippy.js/dist/tippy.css',
    path.resolve(__dirname, 'assets/scss/reset.scss')
  ]
})