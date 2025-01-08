import type { $Fetch } from 'nitropack'

export const $api = $fetch.create({
  retry: 1,
  retryDelay: 3000,
  retryStatusCodes: [503, 504],
  // Request interceptor
  async onRequest({ options }) {
    const authStore = useAuthStore()

    options.baseURL = String(useRuntimeConfig().public.apiBaseUrl || '/api')

    options.headers.set('Authorization', `Bearer ${authStore.accessToken}`)
    options.headers.set('Csrf-Token', useCsrf().csrf)
  },
  async onResponseError(error) {
    const authStore = useAuthStore()
    const isRequestFromExternalUrl = !String(error.response.url).startsWith(String(useRuntimeConfig().public.appBaseUrl))
    switch (error.response?.status) {
      case 401:
        if (error.request.toString().includes('auth') || isRequestFromExternalUrl)
          return

        try {
          await authStore.signOut()
        }
        catch {}
        finally {
          authStore.signIn()

          notifyError({
            content: 'You are not authorized to perform this action.',
          })
        }
        break
      default:
        notifyError({
          content: error.response?.statusText || 'Internal Server Error',
        })
        break
    }
  },
}) as $Fetch
