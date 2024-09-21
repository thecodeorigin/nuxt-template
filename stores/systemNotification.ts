import type { Tables } from '@/server/types/supabase'
import type { ParsedFilterQuery } from '@/server/utils/filter'

type Notification = Tables<'sys_notifications'>

export const useSystemNotificationStore = defineStore('SystemNotification', () => {
  async function fetchNotifications(query: Partial<ParsedFilterQuery>) {
    return $api<Notification[]>('/notifications', {
      query,
    })
  }

  async function markRead(id: string) {
    return $api<Notification>(`/notifications/${id}`, {
      method: 'PATCH',
      body: {
        read_at: new Date(),
      },
    })
  }

  async function markUnread(id: string) {
    return $api<Notification>(`/notifications/${id}`, {
      method: 'PATCH',
      body: {
        read_at: null,
      },
    })
  }

  async function markAllRead() {
    return $api<Notification>('/notifications/mark-all-read', {
      method: 'PATCH',
    })
  }

  async function markAllUnread() {
    return $api<Notification>('/notifications/mark-all-unread', {
      method: 'PATCH',
    })
  }

  async function deleteNotification(id: string) {
    return $api<Notification>(`/notifications/${id}`, {
      method: 'DELETE',
    })
  }
  return {
    fetchNotifications,
    markRead,
    markUnread,
    markAllRead,
    markAllUnread,
    deleteNotification,
  }
})
