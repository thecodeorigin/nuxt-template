import type { Props } from 'vue-loading-overlay'

interface LoadingOptions extends Props {}

export function loading(options?: LoadingOptions) {
  const { $loading } = useNuxtApp()

  return $loading.show(options)
}
