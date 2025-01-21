import type { ToastOptions } from 'vue-toastification/dist/types/types'
import defu from 'defu'

interface NotificationOptions extends Omit<ToastOptions, 'type'> {
  content?: string
}

const notificationDefaultOptions: NotificationOptions = {
  content: '',
}

function getToast() {
  if (import.meta.server)
    return null

  const { $toast } = useNuxtApp()

  return $toast
}

export function notifyError(options: NotificationOptions) {
  getToast()?.error(
    options.content || '',
    defu(options, notificationDefaultOptions),
  )
}

export function notifySuccess(options: NotificationOptions) {
  getToast()?.success(
    options.content || '',
    defu(options, notificationDefaultOptions),
  )
}

export function notifyWarning(options: NotificationOptions) {
  getToast()?.warning(
    options.content || '',
    defu(options, notificationDefaultOptions),
  )
}

export function notifyInfo(options: NotificationOptions) {
  getToast()?.info(
    options.content || '',
    defu(options, notificationDefaultOptions),
  )
}
