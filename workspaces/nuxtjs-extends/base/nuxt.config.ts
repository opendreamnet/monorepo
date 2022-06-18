import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  // Disable server-side rendering
  // ssr: false,

  // Target
  target: 'static',

  // Global page headers
  meta: {
    meta: [
      { name: 'format-detection', content: 'telephone=no' },
      { name: 'monetization', content: process.env.META_MONETIZATION || '$ilp.uphold.com/ZjjF93fX8YKy' }
    ]
  },

  //
  publicRuntimeConfig: {
    name: process.env.npm_package_displayName,
    description: process.env.npm_package_description,
    version: process.env.npm_package_version
  },

  // PWA module configuration
  pwa: {
    meta: {
      name: process.env.npm_package_displayName,
      author: 'OpenDreamNet',
      description: process.env.npm_package_description
    },
    manifest: {
      name: process.env.npm_package_displayName,
      short_name: process.env.npm_package_displayName,
      description: process.env.npm_package_description,
      lang: 'en'
    }
  },

  //
  markdownit: {
    runtime: true // Support `$md()`
  },

  // https://github.com/nuxt-community/gtm-module
  // Used for basic analytics and displaying the coookie consent alert.
  gtm: {
    id: process.env.GOOGLE_TAG_MANAGER_ID
  }
})
