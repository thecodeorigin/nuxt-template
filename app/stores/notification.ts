import type { ParsedFilterQuery } from '@base/server/utils/filter'

export const useNotificationStore = defineStore('notification', () => {
  const authStore = useAuthStore()

  function fetchNotifications(query: Partial<ParsedFilterQuery>) {
    return $api(`/api/users/${authStore.currentUser?.sub}/notifications`, {
      query,
    })
  }

  async function markRead(id: string) {
    return $api(`/api/users/${authStore.currentUser?.sub}/notifications/${id}`, {
      method: 'PATCH',
      body: {
        read_at: new Date(),
      },
    })
  }

  async function markUnread(id: string) {
    return $api(`/api/users/${authStore.currentUser?.sub}/notifications/${id}`, {
      method: 'PATCH',
      body: {
        read_at: null,
      },
    })
  }

  async function markAllRead() {
    return $api(`/api/users/${authStore.currentUser?.sub}/notifications/mark-all-read`, {
      method: 'PATCH',
    })
  }

  async function markAllUnread() {
    return $api(`/api/users/${authStore.currentUser?.sub}/notifications/mark-all-unread`, {
      method: 'PATCH',
    })
  }

  async function deleteNotification(id: string) {
    return $api(`/api/users/${authStore.currentUser?.sub}/notifications/${id}`, {
      method: 'DELETE',
    })
  }
  async function countUnreadNotifications() {
    return $api(`/api/users/${authStore.currentUser?.sub}/notifications/unread`)
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
