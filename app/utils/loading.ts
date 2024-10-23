import type { AppContext, ComponentInternalInstance, ComponentPublicInstance, VNode } from 'vue'
import type { ILoadingService, LoadingServiceOptions } from '@base/components/dialogs/loading/loading-dialog'

import { hasOwn, isClient } from '@vueuse/core'
import { h } from 'vue'

import { LoadingDialog } from '#components'

const VNodeLoading = h(LoadingDialog)

const loadingInstance = new Map<
  ComponentInternalInstance,
  {
    options: any
    resolve: (res: any) => void
    reject: (reason?: any) => void
  }
>()

function showLoading(options: any, appContext?: AppContext | null) {
  const { instance, destroy } = renderVNodeTo(VNodeLoading, options.appendTo, appContext)

  // Adding destruct method.
  // when transition leaves emitting `vanish` evt. so that we can do the clean job.
  options.onVanish = () => {
    destroy()

    loadingInstance.delete(instance) // Remove vm to avoid mem leak.
  }

  for (const prop in options) {
    if (hasOwn(options, prop) && !hasOwn(instance.proxy!.$props as any, prop)) {
      instance.proxy![prop as keyof ComponentPublicInstance] = options[prop]
    }
  }

  if (instance.exposed?.setVisible)
    instance.exposed?.setVisible(true)

  return instance
}

async function LoadingService(options: string | VNode, appContext?: AppContext | null): Promise<void>
async function LoadingService(options: LoadingServiceOptions, appContext?: AppContext | null): Promise<void>
function LoadingService(options: LoadingServiceOptions | string | VNode = {}, appContext: AppContext | null = null): Promise<void> {
  const error = '' as string

  if (!isClient)
    return Promise.reject(new Error(error))

  return new Promise((resolve, reject) => {
    const vm = showLoading(
      options,
      appContext ?? (LoadingService as any as ILoadingService)._context,
    )
    loadingInstance.set(vm, {
      options,
      resolve,
      reject,
    })
  })
}

LoadingService.close = () => {
  loadingInstance.forEach((_, vm) => {
    if (vm.exposed?.hide)
      vm.exposed.hide()
  })

  loadingInstance.clear()
}

LoadingService._context = null

const _loading = LoadingService as any as ILoadingService

export { _loading as loading }
