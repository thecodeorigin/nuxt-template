import type { NotificationQuery } from '#layers/notification/shared/schemas/notification'

export function useNotificationApi() {
  function fetchNotifications(query: NotificationQuery) {
    return $http('/api/notifications', { query: { ...query } })
  }
  function fetchUnreadCount() {
    return $http('/api/notifications/unread-count')
  }
  function markNotificationRead(id: string) {
    return $http('/api/notifications/:id/read', { method: 'PATCH', query: { id } })
  }
  return { fetchNotifications, fetchUnreadCount, markNotificationRead }
}
