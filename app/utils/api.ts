import type { $Fetch } from 'nitropack'
export const $api = $fetch.create({
  retry: 1,
  retryDelay: 3000,
  retryStatusCodes: [503, 504],
  // Request interceptor
  async onRequest({ options }) {
    options.baseURL = String(useRuntimeConfig().public.apiBaseUrl || '/api')

    options.headers = {
      ...options.headers,
      ...useRequestHeaders(['cookie']) /** need this for calls from SSR: https://auth.sidebase.io/guide/authjs/server-side/session-access#session-access-and-route-protection */,
    }
  },
  async onResponseError(error) {
    const authStore = useAuthStore()
    const isRequestToOurWebsite = String(error.response.url).startsWith(String(useRuntimeConfig().public.appBaseUrl));
    switch (error.response?.status) {
      case 401:
        if (error.request.toString().includes('auth') || !isRequestToOurWebsite)
          return

        try {
          await authStore.signOut({ redirect: false, callbackUrl: '/auth/login' })
        }
        catch {}
        finally {
          navigateTo({ name: 'auth-login' })
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
