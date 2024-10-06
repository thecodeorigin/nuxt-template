export function formatCreatedAt(createdAt: string) {
  const { t } = useI18n()
  const now = new Date().getTime()
  const diffTime = now - new Date(createdAt).getTime()
  const seconds = diffTime / 1000
  const minutes = seconds / 60
  const hours = minutes / 60
  const days = hours / 24
  const months = days / 30
  const years = months / 12

  if (seconds < 60) {
    return t('now')
  }
  else if (minutes < 60) {
    return `${Math.floor(minutes)} ${t('minutes')} ${t('ago')}`
  }
  else if (hours < 24) {
    return `${Math.floor(hours)} ${t('hours')} ${t('ago')}`
  }
  else if (days < 30) {
    return `${Math.floor(days)} ${t('days')} ${t('ago')}`
  }
  else if (months < 12) {
    return `${Math.floor(months)} ${t('months')} ${t('ago')}`
  }
  else {
    return `${Math.floor(years)} ${t('years')} ${t('ago')}`
  }
}
