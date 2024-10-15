export function confirmation(message: string) {
  const notificationStore = useMessageStore()

  return notificationStore.showConfirmation(message)
}
