import * as Sentry from '@sentry/browser'

export default defineNuxtPlugin({
  name: 'sentry',
  parallel: true,
  setup(nuxtApp) {
    if (import.meta.prerender)
      return

    const config = useRuntimeConfig()

    if (config.public.sentry.dsn) {
      nuxtApp.hook('vue:setup', () => {
        const scope = Sentry.getCurrentScope()
        const currentUser = useLogtoUser()

        if (currentUser) {
          scope.setUser({
            id: currentUser.sub,
            name: currentUser.name,
            email: currentUser.email || '',
          })
        }
      })
    }
  },
})
