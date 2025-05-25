export function useSafeI18n() {
  const nuxtApp = useNuxtApp()

  if (nuxtApp.$i18n) {
    return nuxtApp.$i18n
  }
  else {
    // mock useI18n
    return {
      t: (key: string) => key,
      locale: 'en',
      availableLocales: ['en'],
      setLocale: (locale: string) => {
        console.warn(`Setting locale to ${locale} is not supported in this mock implementation.`)
      },
    }
  }
}
