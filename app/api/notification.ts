import type { ParsedFilterQuery } from '@base/server/utils/filter'
import type { CountNotifications, Notification } from '@base/types'

export function useApiNotification() {
  function fetchNotifications(query?: Partial<ParsedFilterQuery>) {
    return $api(`/api/notifications`, {
      query,
    })
  }

  function markRead(id: string) {
    return $api(`/api/notifications/${id}`, {
      method: 'PATCH',
      body: {
        read_at: new Date(),
      },
    })
  }

  function markUnread(id: string) {
    return $api(`/api/notifications/${id}`, {
      method: 'PATCH',
      body: {
        read_at: null,
      },
    })
  }

  function markAllRead() {
    return $api(`/api/notifications/read`, {
      method: 'PATCH',
    })
  }

  function markAllUnread() {
    return $api(`/api/notifications/unread`, {
      method: 'PATCH',
    })
  }

  function deleteNotification(id: string) {
    return $api(`/api/notifications/${id}`, {
      method: 'DELETE',
    })
  }

  function countUnreadNotifications() {
    return $api(`/api/notifications/unread`)
  }

  function createTokenDevice(token: string) {
    return $api(`/api/devices`, {
      method: 'POST',
      body: { token },
    })
  }

  function deleteTokenDevice(token: string) {
    return $api(`/api/devices`, {
      method: 'DELETE',
      body: { token },
    })
  }

  return {
    fetchNotifications,
    markRead,
    markUnread,
    markAllRead,
    markAllUnread,
    deleteNotification,
    countUnreadNotifications,
    createTokenDevice,
    deleteTokenDevice,
  }
}
