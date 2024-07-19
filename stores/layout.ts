import { omit } from 'lodash-es'
import type { HorizontalNavItem, NavGroupType, VerticalNavItem } from '@/@layouts/types'

export const useLayoutStore = defineStore('layout', () => {
  const router = useRouter()

  const { can } = useAbility()

  const layoutItems = computed(
    () => {
      const results: (VerticalNavItem & {
        group: NavGroupType
      })[] = []

      for (const route of router.getRoutes()) {
        if (route.meta.sidebar) {
          const item = {
            action: route.meta.action,
            subject: route.meta.subject,
            ...route.meta.sidebar,
          }

          if (!item.action || !item.subject || can(item.action, item.subject))
            results.push(item)
        }
      }

      return results
    },
  )

  const horizontalLayoutItems = computed(
    () => layoutItems.value.map(
      i => omit(i, 'heading'),
    ) as (HorizontalNavItem & {
      group: NavGroupType
    })[],
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
