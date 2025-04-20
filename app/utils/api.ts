import type { $Fetch } from 'nitropack'

export const $api = $fetch.create({
  retry: 1,
  retryDelay: 3000,
  retryStatusCodes: [503, 504],
  // Request interceptor
  async onRequest({ options }) {
    const authStore = useAuthStore()

    options.baseURL = String(useRuntimeConfig().public.apiBaseUrl || '/api')

    if (authStore.crsfToken)
      options.headers.set('Csrf-Token', authStore.crsfToken)
  },
  async onResponseError(error) {
    const { t } = useI18n()

    const isRequestFromExternalUrl = !String(error.response.url).startsWith(String(useRuntimeConfig().public.appBaseUrl))
    switch (error.response?.status) {
      case 401:
        if (error.request.toString().includes('auth') || isRequestFromExternalUrl)
          return

        try {
          await navigateTo({ path: '/sign-out' }, { external: true })
        }
        catch {}
        finally {
          navigateTo({ path: '/sign-in' }, { external: true })

          notifyError({
            content: t('You are not authorized to perform this action.'),
          })
        }
        break
      default:
        notifyError({
          content: t(getErrorMessage(error)),
        })
        break
    }
  },
}) as $Fetch
