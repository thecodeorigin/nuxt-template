export type NotificationLocation = 'top' | 'bottom'

export type NotificationType = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error'

export interface NotifyOptions {
  type?: NotificationType
  location?: NotificationLocation
  timeout?: number
  outline?: boolean
}

export const useNotificationStore = defineStore('notification', () => {
  const notificationVisible = ref(false)
  const notificationLocation = ref<NotificationLocation>('bottom')
  const notificationMessage = ref('')
  const notificationType = ref<NotificationType>()
  const notificationTimeout = ref(3000)
  const notificationOutline = ref(false)

  const confirmationMessage = ref('')

  const notificationProps = computed(() => ({
    modelValue: notificationVisible.value,
    location: notificationLocation.value,
    color: notificationType.value,
    timeout: notificationTimeout.value,
    outline: notificationOutline.value,
    multiline: true,
  }))

  function showNotification(message: string, options?: NotifyOptions) {
    notificationVisible.value = true
    notificationMessage.value = message
    notificationType.value = options?.type
    notificationLocation.value = options?.location || 'bottom'
    notificationTimeout.value = options?.timeout || 10000
    notificationOutline.value = options?.outline || false

    setTimeout(hideNotification, options?.timeout || notificationTimeout.value)
  }

  function hideNotification() {
    notificationVisible.value = false
    notificationMessage.value = ''
    notificationType.value = 'success'
    notificationLocation.value = 'bottom'
    notificationTimeout.value = 3000
  }

  let confirmationResolver: (value: boolean) => void
  function showConfirmation(message: string) {
    confirmationMessage.value = message

    return new Promise<boolean>((resolve) => {
      confirmationResolver = resolve
    })
  }

  function resolveConfirmation(value: boolean) {
    if (confirmationResolver) {
      confirmationResolver(value)

      confirmationMessage.value = ''
    }
  }

  return {
    notificationProps,
    notificationMessage,
    confirmationMessage,
    showNotification,
    hideNotification,
    showConfirmation,
    resolveConfirmation,
  }
})
