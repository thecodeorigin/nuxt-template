import { omit } from 'lodash-es'
import type { HorizontalNavItem, VerticalNavItem } from '@/@layouts/types'

export const useLayoutStore = defineStore('layout', () => {
  const router = useRouter()

  const sidebarItems = computed(
    () => {
      const results: VerticalNavItem[] = []

      for (const route of router.getRoutes()) {
        if (route.meta.sidebar) {
          results.push({
            action: route.meta.action,
            subject: route.meta.subject,
            ...route.meta.sidebar,
          })
        }
      }

      return results
    },
  )

  const horizontalSidebarItems = computed(
    () => sidebarItems.value.map(
      i => omit(i, 'heading'),
    ) as HorizontalNavItem[],
  )

  return {
    sidebarItems,
    horizontalSidebarItems,
  }
})
