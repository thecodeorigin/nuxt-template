export function confirmation(message: string) {
  const notificationStore = useNotificationStore()

  return notificationStore.showConfirmation(message)
}
