const { merge } = require('lodash')
const { } = require('nuxt')
const tailwindConfig = require('./tailwind.config')

Object.defineProperty(exports, '__esModule', {
  value: true
})

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development'
}

/**
 * Tailwind configuration
 */
exports.tailwindConfig = tailwindConfig

/**
 *
 * @returns {import('@nuxt/types').NuxtConfig}
 */
exports.getNuxtConfig = () => {
  /** @type import('@nuxt/types').NuxtConfig */
  return {
    // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
    ssr: false,

    // Target: https://go.nuxtjs.dev/config-target
    target: 'static',

    // Global page headers: https://go.nuxtjs.dev/config-head
    head: {
      htmlAttrs: {
        lang: 'en'
      },
      meta: [
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'monetization', content: process.env.META_MONETIZATION || '$ilp.uphold.com/ZjjF93fX8YKy' }
      ]
    },

    // Loading. (https://nuxtjs.org/docs/2.x/configuration-glossary/configuration-loading)
    loading: {
      color: tailwindConfig.theme.extend.colors.primary.DEFAULT,
      failedColor: tailwindConfig.theme.extend.colors.danger.DEFAULT,
      height: '3px',
      continuous: true
    },

    // Loading indicator. (https://nuxtjs.org/docs/2.x/configuration-glossary/configuration-loading-indicator)
    loadingIndicator: {
      name: 'cube-grid',
      color: tailwindConfig.theme.extend.colors.primary.DEFAULT,
      background: tailwindConfig.theme.extend.colors.background
    },

    // Global CSS: https://go.nuxtjs.dev/config-css
    css: [
      '@opendreamnet/nuxtjs-base/assets/css/reset.scss',
      '@opendreamnet/nuxtjs-base/assets/css/input.scss',
      '@opendreamnet/nuxtjs-base/assets/css/checkbox.scss',
      'tippy.js/dist/tippy.css'
    ],

    // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
    plugins: [
      require.resolve('@opendreamnet/nuxtjs-base/plugins/boot.ts')
      // '~/node_modules/@opendreamnet/nuxtjs-base/plugins/boot.ts'
    ],

    // Auto import components: https://go.nuxtjs.dev/config-components
    components: [
      require.resolve('@opendreamnet/nuxtjs-base/components'),
      //'~/node_modules/@opendreamnet/nuxtjs-base/components',
      '~/components'
    ],

    // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
    buildModules: [
      // https://go.nuxtjs.dev/typescript
      '@nuxt/typescript-build',
      // https://go.nuxtjs.dev/tailwindcss
      '@nuxtjs/tailwindcss',
      // https://github.com/nuxt-community/style-resources-module
      '@nuxtjs/style-resources'
    ],

    // Modules: https://go.nuxtjs.dev/config-modules
    modules: [],

    // https://github.com/nuxt-community/style-resources-module
    styleResources: {
      scss: '@opendreamnet/nuxtjs-base/assets/css/functions.scss'
    },

    // PWA module configuration: https://go.nuxtjs.dev/pwa
    pwa: {
      meta: {
        name: process.env.npm_package_displayName,
        author: 'OpenDreamnet',
        description: process.env.npm_package_description,
        theme_color: tailwindConfig.theme.extend.colors.primary.DEFAULT
      },
      manifest: {
        name: process.env.npm_package_displayName,
        short_name: process.env.npm_package_displayName,
        description: process.env.npm_package_description,
        background_color: tailwindConfig.theme.extend.colors.background,
        lang: 'en'
      }
    },

    //
    markdownit: {
      runtime: true // Support `$md()`
    },

    // Runtime env
    publicRuntimeConfig: {
      name: process.env.npm_package_displayName,
      description: process.env.npm_package_description,
      version: process.env.npm_package_version
    }
  }
}

/**
 * 
 * @param {import('@nuxt/types').NuxtConfig} config 
 * @returns {import('@nuxt/types').NuxtConfig}
 */
exports.setNuxtConfig = (config) => {
  return merge(exports.getNuxtConfig(), config)
}

exports.setTailwindConfig = (config) => {
  return merge(exports.tailwindConfig, config)
}
