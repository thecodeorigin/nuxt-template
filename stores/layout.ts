import { omit } from 'lodash-es'
import type { RouteRecordNormalized } from 'vue-router'
import type { HorizontalNavItem, NavGroupType, VerticalNavItem } from '@/@layouts/types'

// TODO: Simplify VerticalNavItem and HorizontalNavItem because now we generate it from routes
type SidebarItem = VerticalNavItem & { group: NavGroupType, to: RouteRecordNormalized, children?: SidebarItem[] }
type HorizontalSidebarItem = HorizontalNavItem & { group: NavGroupType, to: RouteRecordNormalized, children?: HorizontalSidebarItem[] }

function createRouteTree(routes: RouteRecordNormalized[] = []): SidebarItem[] {
  const { can } = useAbility()

  let tree: SidebarItem[] = []

  for (const route of routes) {
    if (!route.meta.sidebar)
      continue

    const item = route.meta.sidebar as SidebarItem
    const to = route
    const children = createRouteTree(route.children as RouteRecordNormalized[])

    if (children.length) {
      item.children = children
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
      return !children.some(child => child.to.name === item.to.name)
    })
  }

  return tree
}

export const useLayoutStore = defineStore('layout', () => {
  const router = useRouter()

  const layoutItems = computed(
    () => createRouteTree(router.getRoutes()),
  )

  const horizontalLayoutItems = computed(
    () => layoutItems.value.map(
      i => omit(i, 'heading'),
    ) as HorizontalSidebarItem[],
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
