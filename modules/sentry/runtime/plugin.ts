import * as Sentry from '@sentry/browser'

export default defineNuxtPlugin({
  name: 'sentry',
  parallel: true,
  dependsOn: ['auth'],
  setup(nuxtApp) {
    const config = useRuntimeConfig()

    if (config.public.sentry.dsn) {
      nuxtApp.hook('vue:setup', () => {
        const scope = Sentry.getCurrentScope()
        const authStore = useAuthStore()

        if (authStore.isAuthenticated && authStore.currentUser) {
          scope.setUser({
            id: authStore.currentUser.id,
            name: authStore.currentUser.name,
            email: authStore.currentUser.email || '',
          })
        }
      })
    }
  },
})
