import type { RouteLocationNormalized } from 'vue-router'

export function canNavigate(to: RouteLocationNormalized) {
  const { can } = useAbility()

  if (!to.meta.action || !to.meta.subject)
    return true

  return can(to.meta.action, to.meta.subject)
}
