import type { Notification } from '#layers/notifications/shared/schemas/notification'
import { useNotificationApi } from '#layers/notifications/app/api/useNotificationApi'

const PAGE = 20

export const useNotificationStore = defineStore('notifications', () => {
  const api = useNotificationApi()

  const isOpen = ref(false)
  const items = ref<Notification[]>([])
  const unreadCount = ref(0)
  const hasMore = ref(false)
  const loading = ref(false)
  const offset = ref(0)

  async function refreshUnreadCount() {
    try {
      const { count } = await api.fetchUnreadCount()
      unreadCount.value = count
    }
    catch {
      //
    }
  }

  async function loadInitial() {
    loading.value = true
    try {
      const { items: list, hasMore: more } = await api.fetchNotifications({ offset: 0, limit: PAGE })
      items.value = list
      offset.value = list.length
      hasMore.value = more
    }
    finally {
      loading.value = false
    }
  }

  async function loadMore() {
    if (!hasMore.value || loading.value)
      return
    loading.value = true
    try {
      const { items: list, hasMore: more } = await api.fetchNotifications({ offset: offset.value, limit: PAGE })
      items.value = [...items.value, ...list]
      offset.value += list.length
      hasMore.value = more
    }
    finally {
      loading.value = false
    }
  }

  async function open() {
    isOpen.value = true
    if (items.value.length === 0)
      await loadInitial()
  }

  async function markRead(id: string) {
    const updated = await api.markNotificationRead(id)
    items.value = items.value.map(n => (n.id === id ? updated : n))
    if (unreadCount.value > 0)
      unreadCount.value--
  }

  return { isOpen, items, unreadCount, hasMore, loading, refreshUnreadCount, loadInitial, loadMore, open, markRead }
})
