import type { AppContext } from 'vue'
import { isFunction } from 'lodash-es'
import { isVNode, render } from 'vue'

export function renderPropToVNode(prop: any) {
  return isFunction(prop)
    ? prop
    : isVNode(prop)
      ? () => prop
      : null
}

export function renderVNodeTo(vnode: VNode, appendTo: string | HTMLElement, appContext: AppContext | null = null) {
  const container = document.createElement('div')

  vnode.appContext = appContext

  render(vnode, container)

  if (container.firstElementChild)
    getAppendToElement(appendTo)?.appendChild(container.firstElementChild)

  return {
    instance: vnode.component!,
    destroy() {
      render(null, container)
    },
  }
}
