<script setup lang="ts">
import { formatTimeAgo, useAsyncState, useDebounceFn, useInfiniteScroll } from '@vueuse/core'
import type { Notification } from '@base/types'

definePageMeta({
  client: true,
})

const { isNotificationsSlideoverOpen, hasUnreadNotification } = useDashboard()
const notificationStore = useNotificationStore()
const notificationQuery = ref({
  page: 1,
  limit: 10,
  keyword: '',
  sortAsc: false,
  sortBy: 'created_at',
})
const notifications = ref<Notification[]>([])
const container = useTemplateRef('container')
const isMax = ref(false)

const { isLoading, execute } = useAsyncState(
  async () => {
    const data = await notificationStore.fetchNotifications(notificationQuery.value)
    if (data.length < notificationQuery.value.limit) {
      isMax.value = true
    }
    notifications.value.push(...data)
    return data
  },
  [] as Notification[],
)

const { state: countUnreadNotifications, execute: fetchUnreadNotifications } = useAsyncState(
  async () => {
    const data = await notificationStore.countUnreadNotifications()
    return data
  },
  { total: 0 } as { total: number },
)

useInfiniteScroll(
  container,
  async () => {
    if (isMax.value || isLoading.value)
      return
    notificationQuery.value.page++
    await execute()
  },
  { distance: 10 },
)

watch(() => countUnreadNotifications.value.total, () => {
  hasUnreadNotification.value = countUnreadNotifications.value.total > 0
})

async function handleNotificationClick(notification: Notification) {
  if (!notification.read_at) {
    await notificationStore.markRead(notification.id)
  }
  else {
    await notificationStore.markUnread(notification.id)
  }

  for (const item of notifications.value) {
    if (notification.id === item.id) {
      item.read_at = !notification.read_at ? new Date().toDateString() : ''
      break
    }
  }
  await fetchUnreadNotifications()
}
async function markAllRead() {
  await notificationStore.markAllRead()
  notifications.value.forEach((item) => {
    item.read_at = new Date().toDateString()
  })
  await fetchUnreadNotifications()
}
</script>

<template>
  <UDashboardSlideover
    v-model="isNotificationsSlideoverOpen"
    title="Notifications"
  >
    <div ref="container" class="container max-h-full overflow-y-auto">
      <div class="flex">
        <UButton
          v-if="notifications.length"
          color="gray"
          variant="ghost"
          class="rounded-lg px-4"
          square
          @click="markAllRead()"
        >
          <UIcon
            name="i-heroicons-bell"
            class="w-5 h-5"
          />
          Mark all as read
        </UButton>
      </div>
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :to="`/inbox?id=${notification.id}`"
        class="p-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer flex items-center gap-3 relative"
        @click="handleNotificationClick(notification)"
      >
        <UChip
          color="red"
          :show="!notification.read_at"
          inset
        />
        <div class="text-sm flex-1 grid">
          <p class="grid grid-cols-3 gap-4">
            <span class="col-span-2 text-gray-900 dark:text-white font-medium truncate">{{ notification.title }}</span>
            <time
              :datetime="notification.created_at"
              class="text-gray-500 dark:text-gray-400 text-xs"
              v-text="formatTimeAgo(new Date(notification.created_at))"
            />
          </p>
          <p class="text-gray-500 dark:text-gray-400">
            {{ notification.message }}
          </p>
        </div>
      </div>
      <div
        v-if="isLoading"
        class="p-3 rounded-md flex items-center justify-center"
      >
        <BaseIcon name="IconSpinner" class="w-8 h-8 text-primary" />
      </div>
      <div
        v-else-if="isMax"
        class="p-3 rounded-md flex items-center justify-center"
      >
        No more notifications
      </div>
    </div>
  </UDashboardSlideover>
</template>
