import type { $Fetch } from 'nitropack'
import { useAuthApi } from '~/api/useAuthApi'

declare module 'ofetch' {
  interface FetchOptions {
    silent?: boolean
  }
}

function interpolatePath(path: string, params: Record<string, string>) {
  return path.replace(/:(\w+)/g, (match, key) => {
    if (key in params) {
      const val = params[key]

      delete params[key]

      return String(val)
    }
    return match
  })
}

export const $http = $fetch.create({
  onRequest(context) {
    const { options } = context

    // Handle loading indicator
    if (!options.silent && import.meta.client) {
      useLoadingIndicator().start()
    }

    if (typeof context.request === 'string' && options.query) {
      context.request = interpolatePath(context.request, options.query)
    }

    if (import.meta.server) {
      const headers = useRequestHeaders(['cookie'])
      options.headers = {
        ...options.headers,
        ...headers,
      }
    }

    const csrfConfig = useCsrf()
    options.headers = {
      ...options.headers,
      [csrfConfig.headerName]: csrfConfig.csrf,
    }
  },
  onResponse(context) {
    if (!context.options.silent && import.meta.client) {
      useLoadingIndicator().finish()
    }
  },
  async onResponseError(error) {
    if (!error.options.silent && import.meta.client) {
      useLoadingIndicator().finish({ error: true })
    }

    const authApi = useAuthApi()

    const statusCode = error?.response?.status

    const isRequestFromExternalUrl = !String(error.response.url).startsWith(getBaseUrl())

    switch (statusCode) {
      case 401: {
        if (error.request.toString().includes('auth') || isRequestFromExternalUrl)
          return
        try {
          await authApi.logout()
        }
        catch {
          //
        }
        finally {
          navigateTo('/auth/login')
        }
        break
      }
      default: {
        //
      }
    }
  },
}) as $Fetch
