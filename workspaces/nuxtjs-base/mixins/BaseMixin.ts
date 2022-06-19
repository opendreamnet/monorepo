import Vue from 'vue'
import tippy, { Props } from 'tippy.js'
import { isString, isEmpty } from 'lodash'
import type { DirectiveBinding, DirectiveOptions } from 'vue/types/options'

/**
 * Returns the options for [Tippy] of the element
 *
 * @param el
 * @param binding
 */
 function getTippyOpts(el: HTMLElement, binding: DirectiveBinding): Partial<Props> {
  // Support for [v-tippy=""]
  const opts: Partial<Props> = typeof binding.value === 'string' 
    ? { content: binding.value } 
    : binding.value || {}

  // We can obtain tooltip content from [title] or [data-content]
  const title = el.getAttribute('title')
  const content = el.getAttribute('data-content')

  if (title && !opts.content) {
    opts.content = title
    el.removeAttribute('title')
  }

  if (content && !opts.content) {
    opts.content = content
  }

  return opts
}

export default Vue.extend({
  directives: {
    tippy: {
      bind(el, binding) {
        const options = getTippyOpts(el, binding)

        if (isEmpty(options.content)) {
          return
        }

        tippy(el, options)
      },
      unbind(el) {
        // @ts-ignore
        el._tippy && el._tippy.destroy()
      },
      update(el, binding) {
        const options = getTippyOpts(el, binding)

        if (isEmpty(options.content)) {
          // @ts-ignore
          el._tippy && el._tippy.destroy()
          return
        }

        // @ts-ignore
        if (el._tippy) {
          // @ts-ignore
          el._tippy.setProps(options)
        } else {
          tippy(el, options)
        }
      }
    } as DirectiveOptions
  }
})