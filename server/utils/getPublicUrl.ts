import { ensurePrefix } from '@antfu/utils'

export function getPublicUrl(path: string) {
  const baseUrl = process.env.NUXT_APP_BASE_URL ?? ''

  const pathWithBaseUrl = `${baseUrl}${path}`

  return `${ensurePrefix('/', pathWithBaseUrl)}`.replaceAll('//', '/')
}
