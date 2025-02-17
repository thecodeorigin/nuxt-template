import type { ParsedFilterQuery } from '@base/server/utils/filter'
import type { CountNotifications, Notification } from '@base/types'

export const useNotificationStore = defineStore('notification', () => {
  const authStore = useAuthStore()
  const userId = computed(() => authStore.currentUser?.sub || '')

  function fetchNotifications(query: Partial<ParsedFilterQuery>) {
    return $api<Notification[]>(`/api/users/${userId.value}/notifications`, {
      query,
    })
  }

  async function markRead(id: string) {
    return $api<Notification>(`/api/users/${userId.value}/notifications/${id}`, {
      method: 'PATCH',
      body: {
        read_at: new Date(),
      },
    })
  }

  async function markUnread(id: string) {
    return $api<Notification>(`/api/users/${userId.value}/notifications/${id}`, {
      method: 'PATCH',
      body: {
        read_at: null,
      },
    })
  }

  async function markAllRead() {
    return $api<Notification>(`/api/users/${userId.value}/notifications/mark-all-read`, {
      method: 'PATCH',
    })
  }

  async function markAllUnread() {
    return $api<Notification>(`/api/users/${userId.value}/notifications/mark-all-unread`, {
      method: 'PATCH',
    })
  }

  async function deleteNotification(id: string) {
    return $api<Notification>(`/api/users/${userId.value}/notifications/${id}`, {
      method: 'DELETE',
    })
  }
  async function countUnreadNotifications() {
    return $api<CountNotifications>(`/api/users/${userId.value}/notifications/unread`)
  }
  return {
    fetchNotifications,
    markRead,
    markUnread,
    markAllRead,
    markAllUnread,
    deleteNotification,
    countUnreadNotifications,
  }
})
