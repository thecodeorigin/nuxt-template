import type { ParsedFilterQuery } from '@base/server/utils/filter'
import type { CountNotifications, Notification } from '@base/types'

export const useNotificationStore = defineStore('notification', () => {
  function fetchNotifications(query: Partial<ParsedFilterQuery>) {
    return $api<Notification[]>(`/api/users/${useLogtoUser()?.sub}/notifications`, {
      query,
    })
  }

  async function markRead(id: string) {
    return $api<Notification>(`/api/users/${useLogtoUser()?.sub}/notifications/${id}`, {
      method: 'PATCH',
      body: {
        read_at: new Date(),
      },
    })
  }

  async function markUnread(id: string) {
    return $api<Notification>(`/api/users/${useLogtoUser()?.sub}/notifications/${id}`, {
      method: 'PATCH',
      body: {
        read_at: null,
      },
    })
  }

  async function markAllRead() {
    return $api<Notification>(`/api/users/${useLogtoUser()?.sub}/notifications/mark-all-read`, {
      method: 'PATCH',
    })
  }

  async function markAllUnread() {
    return $api<Notification>(`/api/users/${useLogtoUser()?.sub}/notifications/mark-all-unread`, {
      method: 'PATCH',
    })
  }

  async function deleteNotification(id: string) {
    return $api<Notification>(`/api/users/${useLogtoUser()?.sub}/notifications/${id}`, {
      method: 'DELETE',
    })
  }
  async function countUnreadNotifications() {
    return $api<CountNotifications>(`/api/users/${useLogtoUser()?.sub}/notifications/unread`)
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
