import { sortBy } from 'lodash-es'
import type { RouteRecordNormalized } from 'vue-router'
import type { NavItem } from '@base/@layouts/types'

export function createRouteTree(routes: RouteRecordNormalized[] = []): NavItem[] {
  const { can } = useAbility()

  let tree: NavItem[] = []

  for (const route of routes) {
    if (!route.meta || !route.meta.sidebar)
      continue

    const item = route.meta.sidebar as NavItem
    const to = route
    const children = createRouteTree(route.children as RouteRecordNormalized[])

    if (children.length) {
      item.children = sortBy(children, [
        function (o) { return o.order || 0 },
      ])
    }

    if (!route.meta.action || !route.meta.subject || can(route.meta.action, route.meta.subject)) {
      tree.push({
        ...item,
        action: route.meta.action,
        subject: route.meta.subject,
        to,
      })
    }

    // filter routes in tree that are also in children
    tree = tree.filter((item) => {
      return !children.some(child => child.to?.name === item.to?.name)
    })
  }

  return sortBy(tree, [
    function (o) { return o.order || 0 },
  ])
}
