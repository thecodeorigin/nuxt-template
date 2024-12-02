import type { RouteLocationNormalized } from 'vue-router'

export function canNavigate(to: RouteLocationNormalized) {
  const config = useRuntimeConfig()

  if (!config.features.authorization)
    return true

  const { can } = useAbility()

  if (!to.meta.action || !to.meta.subject)
    return true

  return can(to.meta.action, to.meta.subject)
}
