/**
 * A safe useI18n that have mocked fallbacks in case the app context is not available.
 *
 * Do not use this widely in the project, only in some plugins, auto-imports that potentially do not
 * have the app context like in notifications, $api, etc.
 */
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
