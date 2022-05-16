import { defineNuxtModule, addPluginTemplate, createResolver } from '@nuxt/kit'
import { name, version } from '../package.json'

export default defineNuxtModule({
  meta: {
    name,
    version,
    configKey: 'fontawesome'
  },
  defaults: {
    addCss: true,
    icons: {},
    proIcons: {}
  },
  async setup(options, nuxt) {
    // Inject CSS
    if (options.addCss) {
      nuxt.options.css.unshift('@fortawesome/fontawesome-svg-core/styles.css')
    }

    const { resolve } = createResolver(import.meta.url)

    // Custom template for dynamic imports
    addPluginTemplate({
      src: resolve('./plugin.ts'),
      filename: 'fontawesome.js',
      mode: 'client',
      options
    })
  }
})