import path from 'path'
import type { NuxtConfig } from '@nuxt/types'
import { merge } from 'lodash'
import { colors } from './tailwind.config'

function getNuxtConfig(projectDir: string): NuxtConfig {
  // Application values
  const name = process.env.APP_NAME
  const shortName = process.env.APP_SHORT_NAME || name
  const author = process.env.APP_AUTHOR || 'OpenDremanet'
  const description = process.env.APP_DESCRIPTION
  const version = process.env.APP_VERSION

  function resolve(...paths: string[]) {
    return path.resolve(__dirname, ...paths)
  }

  function relative(...paths: string[]) {
    return path.relative(projectDir, path.resolve(__dirname, ...paths))
  }

  return {
    server: {
      host: process.env.HOST ?? '0.0.0.0',
      port: process.env.PORT ?? 3000
    },

    // Disable server-side rendering
    ssr: false,

    // Target
    target: 'static',

    // Global page headers
    head: {
      htmlAttrs: {
        lang: 'en'
      },
      meta: [
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'monetization', content: process.env.META_MONETIZATION ?? '$ilp.uphold.com/ZjjF93fX8YKy' }
      ]
    },

    // Loading. (https://nuxtjs.org/docs/2.x/configuration-glossary/configuration-loading)
    loading: {
      color: colors.primary.DEFAULT,
      failedColor: colors.danger.DEFAULT,
      height: '3px',
      continuous: true
    },

    // Loading indicator. (https://nuxtjs.org/docs/2.x/configuration-glossary/configuration-loading-indicator)
    loadingIndicator: {
      name: 'cube-grid',
      color: colors.primary.DEFAULT,
      background: colors.background
    },

    // Global CSS
    css: [
      relative('assets/css/reset.scss'),
      relative('assets/css/forms.scss')
    ],

    // Auto import components
    components: [
      resolve('components'),
      '~/components'
    ],

    // https://github.com/nuxt-community/style-resources-module
    styleResources: {
      scss: relative('assets/css/functions.scss'),
    },

    // PWA module configuration: https://go.nuxtjs.dev/pwa
    pwa: {
      meta: {
        name,
        author,
        description,
        theme_color: colors.primary.DEFAULT
      },
      manifest: {
        name,
        short_name: shortName,
        description,
        background_color: colors.background,
        lang: 'en'
      }
    },

    // Runtime env
    publicRuntimeConfig: {
      name,
      description,
      version
    },

    tailwindcss: {
      configPath: relative('tailwind.config.ts')
    }
  }
}

function setNuxtConfig(config: NuxtConfig, currentDir: string): NuxtConfig {
  return merge(getNuxtConfig(currentDir), config)
}

/**
 * Tailwind configuration
 */
export {
  getNuxtConfig,
  setNuxtConfig
}
