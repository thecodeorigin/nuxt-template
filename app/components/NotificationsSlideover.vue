<script setup lang="ts">
import { formatTimeAgo } from '@vueuse/core'

const { isNotificationsSlideoverOpen } = useDashboard()

const notificationApi = useApiNotification()

const { data: notifications, execute: fetchNotifications } = useAsyncData(
  'notifications',
  () => notificationApi.fetchNotifications({
    limit: 25,
  }),
  {
    immediate: false,
  },
)

watch(isNotificationsSlideoverOpen, (value) => {
  if (value)
    fetchNotifications()
})
</script>

<template>
  <USlideover
    v-model:open="isNotificationsSlideoverOpen"
    title="Notifications"
  >
    <template #body>
      <template v-if="notifications">
        <NuxtLink
          v-for="notification in notifications"
          :key="notification.id"
          class="px-3 py-2.5 rounded-md hover:bg-(--ui-bg-elevated)/50 flex items-center gap-3 relative -mx-3 first:-mt-3 last:-mb-3"
        >
          <div class="text-sm flex-1">
            <p class="flex items-center justify-between">
              <span class="text-(--ui-text-highlighted) font-medium">{{ notification.title }}</span>

              <time
                :datetime="notification.created_at"
                class="text-(--ui-text-muted) text-xs"
                v-text="formatTimeAgo(new Date(notification.created_at))"
              />
            </p>

            <p class="text-(--ui-text-dimmed)">
              {{ notification.message }}
            </p>
          </div>
        </NuxtLink>
      </template>
      <p v-else>
        You don't have any notifications.
      </p>
    </template>
  </USlideover>
</template>
