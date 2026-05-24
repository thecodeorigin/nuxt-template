import type { Directive } from 'vue'
import DOMPurify from 'dompurify'

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node instanceof Element && node.tagName === 'A' && node.getAttribute('target') === '_blank')
    node.setAttribute('rel', 'noopener noreferrer')
})

function sanitize(value: unknown): string {
  return DOMPurify.sanitize(typeof value === 'string' ? value : '', { ADD_ATTR: ['target'] })
}

export const vSanitize: Directive<HTMLElement, string> = {
  mounted(el, binding) {
    el.innerHTML = sanitize(binding.value)
  },
  updated(el, binding) {
    if (binding.value !== binding.oldValue)
      el.innerHTML = sanitize(binding.value)
  },
}
