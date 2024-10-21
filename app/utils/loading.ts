import type { Props } from 'vue-loading-overlay'
import { useLoading } from 'vue-loading-overlay'

interface LoadingOptions extends Props {}

export function loading(options?: LoadingOptions) {
  const $loading = useLoading()

  return $loading.show(options)
}
