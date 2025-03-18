import type { ParsedFilterQuery } from '@base/server/utils/filter'
import type { CountNotifications, Notification } from '@base/types'

export function useApiNotification() {
  function fetchNotifications(query: Partial<ParsedFilterQuery>) {
    return $api<Notification[]>(`/api/users/${useLogtoUser()?.sub}/notifications`, {
      query,
    })
  }

  function markRead(id: string) {
    return $api<Notification>(`/api/users/${useLogtoUser()?.sub}/notifications/${id}`, {
      method: 'PATCH',
      body: {
        read_at: new Date(),
      },
    })
  }

  function markUnread(id: string) {
    return $api<Notification>(`/api/users/${useLogtoUser()?.sub}/notifications/${id}`, {
      method: 'PATCH',
      body: {
        read_at: null,
      },
    })
  }

  function markAllRead() {
    return $api<Notification>(`/api/users/${useLogtoUser()?.sub}/notifications/mark-all-read`, {
      method: 'PATCH',
    })
  }

  function markAllUnread() {
    return $api<Notification>(`/api/users/${useLogtoUser()?.sub}/notifications/mark-all-unread`, {
      method: 'PATCH',
    })
  }

  function deleteNotification(id: string) {
    return $api<Notification>(`/api/users/${useLogtoUser()?.sub}/notifications/${id}`, {
      method: 'DELETE',
    })
  }

  function countUnreadNotifications() {
    return $api<CountNotifications>(`/api/users/${useLogtoUser()?.sub}/notifications/unread`)
  }

  function createTokenDevice(token: string) {
    return $api(`/api/users/${useLogtoUser()?.sub}/devices`, {
      method: 'POST',
      body: { token },
    })
  }

  function deleteTokenDevice(token: string) {
    return $api(`/api/users/${useLogtoUser()?.sub}/devices`, {
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
