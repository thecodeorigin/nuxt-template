import type { AppContext, ComponentPublicInstance, VNode } from 'vue'
import type { Action, Callback, ConfirmationServiceData, ConfirmationServiceOptions, ConfirmationServiceShortcutMethod, IConfirmationService } from '@base/components/dialogs/confirmation/confirm-dialog'

import { hasOwn, isClient } from '@vueuse/core'
import { isElement, isFunction, isString } from 'lodash-es'
import { createVNode, isVNode, render } from 'vue'

import { ConfirmDialog } from '#components'

const confirmationInstance = new Map<
  InstanceType<typeof ConfirmDialog>, // marking doClose as function
  {
    options: any
    callback: Callback | null | undefined
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

function renderPropToVNode(prop: any) {
  return isFunction(prop)
    ? prop
    : isVNode(prop)
      ? () => prop
      : null
}

function initInstance(props: any, container: HTMLElement, appContext: AppContext | null = null) {
  const vnode = createVNode(
    ConfirmDialog,
    props,
    {
      default: renderPropToVNode(props.body),
    },
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

  const vm = instance.proxy as InstanceType<typeof ConfirmDialog>
  // Adding destruct method.
  // when transition leaves emitting `vanish` evt. so that we can do the clean job.
  options.onVanish = () => {
    render(null, container)
    confirmationInstance.delete(vm) // Remove vm to avoid mem leak.
  }

  options.onAction = (action: Action) => {
    const currentConfirmation = confirmationInstance.get(vm)!

    if (options.callback) {
      options.callback(action, instance.proxy)
    }
    else {
      if (action === 'cancel') {
        currentConfirmation.reject('cancel')
      }
      else {
        currentConfirmation.resolve(action)
      }
    }
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

async function ConfirmationService(options: string | VNode, appContext?: AppContext | null): Promise<ConfirmationServiceData>
async function ConfirmationService(options: ConfirmationServiceOptions, appContext?: AppContext | null): Promise<ConfirmationServiceData>
function ConfirmationService(options: ConfirmationServiceOptions | string | VNode, appContext: AppContext | null = null): Promise<{ value: string, action: Action } | Action> {
  const error = '' as string

  if (!isClient)
    return Promise.reject(new Error(error))

  let callback: Callback | null | undefined
  if (isString(options) || isVNode(options)) {
    options = {
      body: options,
    }
  }
  else {
    callback = options.callback
  }

  return new Promise((resolve, reject) => {
    const vm = showConfirmation(
      options,
      appContext ?? (ConfirmationService as any as IConfirmationService)._context,
    )
    confirmationInstance.set(vm, {
      options,
      callback,
      resolve,
      reject,
    })
  })
}

const CONFIRMATION_VARIANTS = ['alert', 'confirm'] as const
const CONFIRMATION_DEFAULT_OPTS: Record<
  typeof CONFIRMATION_VARIANTS[number],
  Partial<ConfirmationServiceOptions>
> = {
  alert: { type: 'primary' },
  confirm: { type: 'danger' },
}

CONFIRMATION_VARIANTS.forEach((confirmationType) => {
  ;(ConfirmationService as any as IConfirmationService)[confirmationType] = confirmationFactory(
    confirmationType,
  ) as ConfirmationServiceShortcutMethod
})

function confirmationFactory(confirmationType: typeof CONFIRMATION_VARIANTS[number]) {
  return (
    body: string | VNode,
    options?: ConfirmationServiceOptions,
    appContext?: AppContext | null,
  ) => {
    return ConfirmationService(
      Object.assign(
        {
          body,
          type: '',
          ...CONFIRMATION_DEFAULT_OPTS[confirmationType],
        },
        options,
        {
          confirmationType,
        },
      ),
      appContext,
    )
  }
}

ConfirmationService.close = () => {
  confirmationInstance.forEach((_, vm) => {
    vm.doClose()
  })

  confirmationInstance.clear()
}

ConfirmationService._context = null

const _confirmation = ConfirmationService as any as IConfirmationService

export { _confirmation as confirmation }
