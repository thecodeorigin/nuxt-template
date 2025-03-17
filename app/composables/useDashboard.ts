import { createSharedComposable } from '@vueuse/core'

function _useDashboard() {
  const route = useRoute()
  const router = useRouter()
  const isHelpSlideoverOpen = ref(false)
  const isNotificationsSlideoverOpen = ref(false)
  const hasUnreadNotification = ref(false)

  defineShortcuts({
    'g-h': () => router.push('/'),
    'g-i': () => router.push('/app/inbox'),
    'g-u': () => router.push('/users'),
    'g-s': () => router.push('/app/settings'),
    '?': () => isHelpSlideoverOpen.value = true,
    'n': () => isNotificationsSlideoverOpen.value = true,
  })

  watch(() => route.fullPath, () => {
    isHelpSlideoverOpen.value = false
    isNotificationsSlideoverOpen.value = false
  })

  return {
    isHelpSlideoverOpen,
    isNotificationsSlideoverOpen,
    hasUnreadNotification,
  }
}

export const useDashboard = createSharedComposable(_useDashboard)
