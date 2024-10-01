export default defineI18nLocale(async (locale) => {
  const _locale = locale || 'en'

  const config = useRuntimeConfig()

  const response = await $fetch<Record<string, any>>(`locales/${_locale}.json`, {
    baseURL: config.AUTH_ORIGIN,
  })

  try {
    response.$vuetify = (await import('vuetify/locale') as any)[_locale]
  }
  catch {
    response.$vuetify = {}
  }

  return response
})
