import { useRuntimeConfig } from '#imports'

export function getBaseUrl() {
  const runtimeConfig = useRuntimeConfig()

  const baseUrl = !import.meta.dev
    ? `https://${runtimeConfig.public.baseDomain}`
    : runtimeConfig.public.sslEnabled
      ? `https://${runtimeConfig.public.baseDomain}`
      : `http://${runtimeConfig.public.baseDomain}`

  return baseUrl
}
