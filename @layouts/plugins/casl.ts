import type { RouteLocationNormalized } from 'vue-router'
import type { NavGroup } from '@layouts/types'

/**
 * Check if user can view item based on it's ability
 * Based on item's action and subject & Hide group if all of it's children are hidden
 * @param {object} item navigation object item
 */
export function canViewNavMenuGroup(item: NavGroup) {
  const { can } = useAbility()

  const hasAnyVisibleChild = item.children.some(i => can(i.action!, i.subject!))

  // If subject and action is defined in item => Return based on children visibility (Hide group if no child is visible)
  // Else check for ability using provided subject and action along with checking if has any visible child
  if (!(item.action && item.subject))
    return hasAnyVisibleChild

  return can(item.action, item.subject) && hasAnyVisibleChild
}

export function canNavigate(to: RouteLocationNormalized) {
  const { can } = useAbility()

  if (!to.meta.action || !to.meta.subject)
    return true

  return can(to.meta.action, to.meta.subject)
}
