import { setNuxtConfig } from '../nuxt.config'

export default setNuxtConfig({
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'OpenDreamnet Playground',
  },

  // Modules for dev and build (recommended)
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    // https://go.nuxtjs.dev/tailwindcss
    '@nuxtjs/tailwindcss',
  ],
}, __dirname)
