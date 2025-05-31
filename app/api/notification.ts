import type { ParsedFilterQuery } from '@base/server/utils/filter'

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

  function updateSettings(payload: Partial<{
    email: boolean | null
    desktop: boolean | null
    product_updates: boolean | null
    weekly_digest: boolean | null
    important_updates: boolean | null
  }>) {
    return $api('/api/auth/notification', {
      method: 'PATCH',
      body: payload,
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
    updateSettings,
  }
}
