import { enGB, vi } from 'date-fns/locale'
import { formatDistanceToNow as _formatDistanceToNow } from 'date-fns'

export function formatDistanceToNow(date: string) {
  const { locale } = useI18n()

  return _formatDistanceToNow(
    new Date(date),
    {
      locale: locale.value === 'en'
        ? enGB
        : vi,
    },
  )
}
