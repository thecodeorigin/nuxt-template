import { omit } from 'lodash-es'
import type { NavItem } from '@base/@layouts/types'

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
