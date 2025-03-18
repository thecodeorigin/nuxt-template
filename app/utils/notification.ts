interface NotificationOptions {
  content: string
}
export function notifyError(options: NotificationOptions) {
  const toast = useToast()

  toast.add({
    title: 'Error',
    description: options.content,
    color: 'error',
  })
}

export function notifySuccess(options: NotificationOptions) {
  const toast = useToast()

  toast.add({
    title: 'Success',
    description: options.content,
    color: 'success',
  })
}

export function notifyWarning(options: NotificationOptions) {
  const toast = useToast()

  toast.add({
    title: 'Warning',
    description: options.content,
    color: 'warning',
  })
}

export function notifyInfo(options: NotificationOptions) {
  const toast = useToast()

  toast.add({
    title: 'Infor',
    description: options.content,
    color: 'info',
  })
}
