import { getPermissionDomains } from '#layers/auth/server/services/permissions-registry'

const REQUIRED = ['user', 'project', 'billing', 'selfhost']

export default defineNitroPlugin(() => {
  const have = new Set(getPermissionDomains().map(d => d.subject))
  const missing = REQUIRED.filter(s => !have.has(s))
  if (missing.length)
    throw new Error(`Permission registry missing domains: ${missing.join(', ')}. Each owning layer must register via definePermissionDomain.`)
})
