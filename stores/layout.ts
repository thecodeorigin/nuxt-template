import { omit, sortBy } from 'lodash-es'
import type { RouteRecordNormalized } from 'vue-router'
import type { NavGroupType, NavItem } from '@/@layouts/types'

function createRouteTree(routes: RouteRecordNormalized[] = []): NavItem[] {
  const { can } = useAbility()

  let tree: NavItem[] = []

  for (const route of routes) {
    if (!route.meta.sidebar)
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

export const useLayoutStore = defineStore('layout', () => {
  const router = useRouter()

  const layoutItems = computed(
    () => createRouteTree(router.getRoutes()),
  )

  const horizontalLayoutItems = computed(
    () => layoutItems.value.map(
      i => omit(i, 'heading'),
    ) as NavItem[],
  )

  const isLoading = ref(false)

  function showLoading() {
    isLoading.value = true
  }

  function hideLoading() {
    isLoading.value = false
  }

  return {
    layoutItems,
    horizontalLayoutItems,
    isLoading,
    showLoading,
    hideLoading,
  }
})
