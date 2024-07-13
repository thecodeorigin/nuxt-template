<script lang="ts" setup>
import type { Tables } from '@/server/types/supabase.js'

type Notification = Tables<'sys_notifications'>
const notifications = ref<Array<Notification>>([])

try {
  const { data } = await useApi('/pages/notifications')
  notifications.value = data.value as Notification[]
}
catch (error) {
  console.error(error)
}

function removeNotification(notificationId: string) {
  notifications.value.forEach(async (item, index) => {
    if (notificationId === item.id) {
      await useApi(`/pages/notifications/${notificationId}`, { method: 'DELETE' })
      notifications.value.splice(index, 1)
    }
  })
}

function markReadOrUnread(notificationId: string[], type: 'read' | 'unread') {
  notifications.value.forEach((item) => {
    notificationId.forEach(async (id) => {
      if (id === item.id) {
        await useApi(`/pages/notifications/${id}`, { method: 'PATCH', body: { read_at: type === 'read' ? new Date() : null } })
        item.read_at = type === 'read' ? new Date().toDateString() : null
      }
    })
  })
}

function handleNotificationClick(notification: Notification) {
  if (!notification.read_at)
    markReadOrUnread([notification.id], 'read')
  else
    markReadOrUnread([notification.id], 'unread')
}
</script>

<template>
  <Notifications
    :notifications="notifications"
    @remove="removeNotification"
    @mark-all-read-or-unread="markReadOrUnread"
    @click:notification="handleNotificationClick"
  />
</template>
