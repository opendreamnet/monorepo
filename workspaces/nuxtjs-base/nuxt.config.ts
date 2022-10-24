import path from 'path'
import { merge } from 'lodash'
import type { NuxtConfig } from '@nuxt/types'
import tailwindConfig from './tailwind.config'

if (!process.env.NODE_ENV) {
  // Default enviroment
  process.env.NODE_ENV = 'development'
}

// Application values
const name = process.env.APP_NAME || process.env.npm_package_displayName || process.env.npm_package_name
const short_name = process.env.APP_SHORT_NAME || name
const author = process.env.APP_AUTHOR || 'OpenDremanet'
const description = process.env.APP_DESCRIPTION || process.env.npm_package_description
const version = process.env.APP_VERSION || process.env.npm_package_version

function getNuxtConfig(): NuxtConfig {
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
      path.resolve(path.dirname(require.resolve('@opendreamnet/nuxtjs-base')), 'plugins', 'boot.ts')
    ],

    // Auto import components: https://go.nuxtjs.dev/config-components
    components: [
      path.resolve(path.dirname(require.resolve('@opendreamnet/nuxtjs-base')), 'components'),
      '~/components'
    ],

    // https://github.com/nuxt-community/style-resources-module
    styleResources: {
      scss: '@opendreamnet/nuxtjs-base/assets/css/functions.scss'
    },

    // PWA module configuration: https://go.nuxtjs.dev/pwa
    pwa: {
      meta: {
        name,
        author,
        description,
        theme_color: tailwindConfig.theme.extend.colors.primary.DEFAULT
      },
      manifest: {
        name,
        short_name,
        description,
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
      name,
      description,
      version
    }
  }
}

function setNuxtConfig(config: NuxtConfig): NuxtConfig {
  return merge(getNuxtConfig(), config)
}

/**
 * Tailwind configuration
 */
export {
  tailwindConfig,
  getNuxtConfig,
  setNuxtConfig
}
