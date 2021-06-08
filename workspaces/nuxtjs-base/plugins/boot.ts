import Vue from 'vue'
import { Plugin } from '@nuxt/types'
import tippy from 'tippy.js'
import BaseMixin from '../mixins/BaseMixin'

// BaseMixin
// Vue.mixin(BaseMixin)

const plugin: Plugin = async() => {
  // TippyJS
  tippy.setDefaultProps({
    delay: [200, 0],
    arrow: true,
    allowHTML: true
  })
}

export default plugin