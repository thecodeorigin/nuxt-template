import type { ToastOptions } from 'vue-toastification/dist/types/types'
import defu from 'defu'

interface NotificationOptions extends Omit<ToastOptions, 'type'> {
  content?: string
}

const notificationDefaultOptions: NotificationOptions = {
  content: '',
}

export function notifyError(options: NotificationOptions) {
  const { $toast } = useNuxtApp()

  $toast.error(
    options.content || '',
    defu(options, notificationDefaultOptions),
  )
}

export function notifySuccess(options: NotificationOptions) {
  const { $toast } = useNuxtApp()

  $toast.success(
    options.content || '',
    defu(options, notificationDefaultOptions),
  )
}

export function notifyWarning(options: NotificationOptions) {
  const { $toast } = useNuxtApp()

  $toast.warning(
    options.content || '',
    defu(options, notificationDefaultOptions),
  )
}

export function notifyInfo(options: NotificationOptions) {
  const { $toast } = useNuxtApp()

  $toast.info(
    options.content || '',
    defu(options, notificationDefaultOptions),
  )
}
