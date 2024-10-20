import type { $Fetch } from 'ofetch'

export const $api = $fetch.create({
  retry: 3,
  retryDelay: 3000,
  retryStatusCodes: [500, 503, 504],
  // Request interceptor
  async onRequest({ options }) {
    // Set baseUrl for all API calls
    options.baseURL = useRuntimeConfig().public.apiBaseUrl || '/api'

    options.headers = {
      ...options.headers,
      ...useRequestHeaders(['cookie']) /** need this for calls from SSR: https://auth.sidebase.io/guide/authjs/server-side/session-access#session-access-and-route-protection */,
    }
  },
  async onResponseError(error) {
    const nuxtApp = useNuxtApp()
    const authStore = useAuthStore()

    switch (error.response?.status) {
      case 422:
        // Handle at component level
        break
      case 401:
        if (error.request.toString().includes('auth'))
          return

        try {
          await authStore.signOut({ callbackUrl: '/auth/login' })
        }
        catch {}
        finally {
          navigateTo({ name: 'auth-login' })
          notify('Unauthorized', {
            type: 'error',
          })
        }
        break
      default:
        await nuxtApp.hooks.callHook('session:cache:refresh')

        notify(error.response?.statusText || 'Internal Server Error', {
          type: 'error',
        })
        break
    }
  },
}) as $Fetch
