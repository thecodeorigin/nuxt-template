interface NotificationOptions {
  content: string
}
export function notifyError(options: NotificationOptions) {
  const { t } = useSafeI18n()
  const toast = useToast()

  toast.add({
    title: t('Error'),
    description: options.content,
    color: 'error',
  })
}

export function notifySuccess(options: NotificationOptions) {
  const { t } = useSafeI18n()
  const toast = useToast()

  toast.add({
    title: t('Success'),
    description: options.content,
    color: 'success',
  })
}

export function notifyWarning(options: NotificationOptions) {
  const { t } = useSafeI18n()
  const toast = useToast()

  toast.add({
    title: t('Warning'),
    description: options.content,
    color: 'warning',
  })
}

export function notifyInfo(options: NotificationOptions) {
  const { t } = useSafeI18n()
  const toast = useToast()

  toast.add({
    title: t('Infor'),
    description: options.content,
    color: 'info',
  })
}
