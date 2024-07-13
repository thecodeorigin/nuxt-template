<script lang="ts" setup>
import type { Tables } from '~/server/types/supabase.js'

const notifications = ref<Tables<'sys_notifications'>[]>([])

async function fetchNotification() {
  $api('/pages/notifications').then((res: any) => {
    notifications.value = res
    console.log(res)
  }).catch(err => console.log(err))
}

onBeforeMount(fetchNotification)

function removeNotification(notificationId: number) {
  notifications.value.forEach((item, index) => {
    if (notificationId === item.id)
      notifications.value.splice(index, 1)
  })
}

function markRead(notificationId: number[]) {
  notifications.value.forEach((item) => {
    notificationId.forEach((id) => {
      if (id === item.id)
        item.read_at = new Date().toISOString()
    })
  })
}

function markUnRead(notificationId: number[]) {
  notifications.value.forEach((item) => {
    notificationId.forEach((id) => {
      if (id === item.id)
        item.read_at = null
    })
  })
}

function handleNotificationClick(notification: Tables<'sys_notifications'>) {
  if (!notification.read_at)
    markRead([notification.id])
}
</script>

<template>
  <Notifications
    :notifications="notifications"
    @remove="removeNotification"
    @read="markRead"
    @unread="markUnRead"
    @click:notification="handleNotificationClick"
  />
</template>
