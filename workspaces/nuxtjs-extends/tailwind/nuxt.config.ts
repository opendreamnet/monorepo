import { defineNuxtConfig } from 'nuxt'
import { createResolver } from '@nuxt/kit'
import config from './tailwind.config.js'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  // Global CSS
  css: [
    resolve('./assets/css/root.scss'),
    resolve('./assets/css/reset.scss'),
    resolve('./assets/css/input.scss'), // FIXME:
    resolve('./assets/css/checkbox.scss'),
  ],

  // Loading bar
  loading: {
    // color: config.theme.extend.colors['primary'].DEFAULT,
    // failedColor: config.theme.extend.colors['danger'].DEFAULT,
    height: '3px',
    continuous: true
  },

  // Loading indicator
  loadingIndicator: {
    name: 'cube-grid',
    // color: config.theme.extend.colors['primary'].DEFAULT,
    // background: config.theme.extend.colors['background']
  },

  // Modules
  modules: [
    // https://go.nuxtjs.dev/tailwindcss
    '@nuxtjs/tailwindcss',
    // https://color-mode.nuxtjs.org
    '@nuxtjs/color-mode',
    // https://gist.github.com/volkipp/56655a3743bd7ebab57a6666833f3ec2
    resolve('./modules/style-resources.ts')
  ],

  colorMode: {
    classSuffix: ''
  },

  // PWA module configuration
  /*
  pwa: {
    meta: {
      theme_color: config.theme.extend.colors['primary'].DEFAULT
    },
    manifest: {
      background_color: config.theme.extend.colors['background'],
    }
  },
  */

  // https://github.com/nuxt-community/style-resources-module
  styleResources: {
    scss: resolve('./assets/css/functions.scss')
  },

  //
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "${resolve(__dirname, 'assets/css/functions.scss')}";`
        }
      }
    }
  },

  // 
  hooks: {
    // @ts-ignore
    'tailwindcss:config'(tailwindConfig) {
      tailwindConfig.content = [
        './components/**/*.{vue,js,ts}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './composables/**/*.{js,ts}',
        './plugins/**/*.{js,ts}',
        // resolve('./App.{js,ts,vue}'),
        // resolve('./app.{js,ts,vue}')
      ]
    }
  }
})