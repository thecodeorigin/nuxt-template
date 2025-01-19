<script setup lang="ts">
import { formatTimeAgo, useAsyncState, useDebounceFn, useInfiniteScroll } from '@vueuse/core'
import type { Notification } from '@base/types'

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
const container = ref<HTMLDivElement | null>(null)
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
  try {
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
    fetchUnreadNotifications()
  }
  catch (error) {
    console.error(error)
  }
}
async function markAllRead() {
  try {
    await notificationStore.markAllRead()
    notifications.value.forEach((item) => {
      item.read_at = new Date().toDateString()
    })
    fetchUnreadNotifications()
  }
  catch (error) {
    console.error(error)
  }
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
        <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
        </svg>
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
