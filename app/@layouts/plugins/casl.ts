import type { RouteLocationNormalized } from 'vue-router'

export function canNavigate(to: RouteLocationNormalized) {
  const config = useRuntimeConfig()

  if (!config.public.features.authorization)
    return true

  const { can } = useAbility()

  return !to.meta.scopes || (
    Array.isArray(to.meta.scopes)
    && to.meta.scopes.some((scope: string) => {
      const [action, subject] = scope.split(':') as [string, string]

      return can(action, subject)
    })
  )
}
