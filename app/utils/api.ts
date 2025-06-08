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
      'Csrf-Token': useCsrf().csrf,
    }
  },
  async onResponseError(error) {
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
          notifyError({
            content: 'You are not authorized to perform this action.',
          })

          navigateTo('/auth/login')
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
