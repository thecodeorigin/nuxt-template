import type { AppContext, ComponentPublicInstance, VNode } from 'vue'
import type { ConfirmationServiceOptions, IConfirmationService } from '@base/components/dialogs/loading/loading-dialog'

import { hasOwn, isClient } from '@vueuse/core'
import { isElement, isString } from 'lodash-es'
import { createVNode, render } from 'vue'

import { LoadingDialog } from '#components'

const confirmationInstance = new Map<
  InstanceType<typeof LoadingDialog>,
  {
    options: any
    resolve: (res: any) => void
    reject: (reason?: any) => void
  }
>()

function getAppendToElement(props: any) {
  let appendTo: HTMLElement | null = document.body
  if (props.appendTo) {
    if (isString(props.appendTo)) {
      appendTo = document.querySelector<HTMLElement>(props.appendTo)
    }
    if (isElement(props.appendTo)) {
      appendTo = props.appendTo
    }

    // should fallback to default value with a warning
    if (!isElement(appendTo)) {
      console.warn(
        'ConfirmationService',
        'the appendTo option is not an HTMLElement. Falling back to document.body.',
      )
      appendTo = document.body
    }
  }

  return appendTo
}

function initInstance(props: any, container: HTMLElement, appContext: AppContext | null = null) {
  const vnode = createVNode(
    LoadingDialog,
    props,
  )
  vnode.appContext = appContext
  render(vnode, container)

  if (container.firstElementChild)
    getAppendToElement(props)?.appendChild(container.firstElementChild)

  return vnode.component
}

function genContainer() {
  return document.createElement('div')
}

function showConfirmation(options: any, appContext?: AppContext | null) {
  const container = genContainer()

  const instance = initInstance(options, container, appContext)!

  const vm = instance.proxy as InstanceType<typeof LoadingDialog>
  // Adding destruct method.
  // when transition leaves emitting `vanish` evt. so that we can do the clean job.
  options.onVanish = () => {
    render(null, container)
    confirmationInstance.delete(vm) // Remove vm to avoid mem leak.
  }

  for (const prop in options) {
    if (hasOwn(options, prop) && !hasOwn(vm.$props, prop as any)) {
      vm[prop as keyof ComponentPublicInstance] = options[prop]
    }
  }

  if (instance.exposed?.setVisible)
    instance.exposed.setVisible(true)

  return vm
}

async function ConfirmationService(options: string | VNode, appContext?: AppContext | null): Promise<void>
async function ConfirmationService(options: ConfirmationServiceOptions, appContext?: AppContext | null): Promise<void>
function ConfirmationService(options: ConfirmationServiceOptions | string | VNode = {}, appContext: AppContext | null = null): Promise<void> {
  const error = '' as string

  if (!isClient)
    return Promise.reject(new Error(error))

  return new Promise((resolve, reject) => {
    const vm = showConfirmation(
      options,
      appContext ?? (ConfirmationService as any as IConfirmationService)._context,
    )
    confirmationInstance.set(vm, {
      options,
      resolve,
      reject,
    })
  })
}

ConfirmationService.close = () => {
  confirmationInstance.forEach((_, vm) => {
    vm.setVisible(false)
  })

  confirmationInstance.clear()
}

ConfirmationService._context = null

const _confirmation = ConfirmationService as any as IConfirmationService

export { _confirmation as loading }
