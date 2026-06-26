import type { $Fetch } from 'nitropack'

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

    // useCsrf is provided by nuxt-security. In demo builds the module is
    // removed from `modules` and the auto-import isn't generated, so the
    // call would throw a ReferenceError. Wrap to make $http still work.
    try {
      const csrfConfig = useCsrf()
      if (csrfConfig?.headerName) {
        options.headers = {
          ...options.headers,
          [csrfConfig.headerName]: csrfConfig.csrf,
        }
      }
    }
    catch {
      // nuxt-security not loaded — skip CSRF header
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

    const statusCode = error?.response?.status

    let isRequestFromExternalUrl = false
    try {
      isRequestFromExternalUrl = !String(error.response.url).startsWith(getBaseUrl())
    }
    catch {
      // getBaseUrl not available in test / nuxt-security not loaded — assume same-origin
    }

    switch (statusCode) {
      case 401: {
        if (error.request.toString().includes('auth') || isRequestFromExternalUrl)
          return
        try {
          const { signOut } = useAuth()
          await signOut()
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
