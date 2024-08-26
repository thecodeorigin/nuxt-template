import type { $Fetch } from 'ofetch'

export const $api = $fetch.create({
  // Request interceptor
  async onRequest({ options }) {
    // Set baseUrl for all API calls
    options.baseURL = useRuntimeConfig().public.apiBaseUrl || '/api'
  },
}) as $Fetch
