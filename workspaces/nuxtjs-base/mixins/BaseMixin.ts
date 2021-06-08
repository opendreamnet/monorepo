import tippy, { Props } from 'tippy.js'
import { isString } from 'lodash'

export default {
  directives: {
    tooltip: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      inserted(el: Element, binding: any): void {
        if (!binding.value) {
          return
        }

        let options: Partial<Props> = {}

        if (isString(binding.value)) {
          options.content = binding.value
        } else {
          options = binding.value
        }

        tippy(el, options)
      }
    }
  }
}