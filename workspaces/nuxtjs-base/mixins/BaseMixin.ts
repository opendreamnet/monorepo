import tippy, { Props } from 'tippy.js'
import { isString } from 'lodash'

export default {
  directives: {
    tooltip: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      inserted(el: HTMLElement, binding: any): void {
        if (!binding.value) {
          return
        }

        const dialog = el.closest('dialog')

        let options: Partial<Props> = {}

        if (isString(binding.value)) {
          options.content = binding.value

          if (dialog) {
            options.appendTo = dialog
          }
        } else {
          options = binding.value
        }

        tippy(el, options)
      }
    }
  }
}