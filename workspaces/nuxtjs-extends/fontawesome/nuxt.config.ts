import { defineNuxtConfig } from 'nuxt'
import { createResolver } from '@nuxt/kit'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  // Modules
  modules: [
    resolve('./module.ts')
  ]
})