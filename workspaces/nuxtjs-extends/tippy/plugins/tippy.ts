import { defineNuxtPlugin } from '#app'
import tippy from 'tippy.js'
import { TippyMixin } from '../mixins/TippyMixin'

export default defineNuxtPlugin((app) => {
  // Default options
  tippy.setDefaultProps({
    delay: [200, 0],
    arrow: true,
    allowHTML: true
  })

  // Inject mixin
  app.vueApp.mixin(TippyMixin)
})