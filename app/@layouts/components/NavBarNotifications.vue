<script lang="ts" setup>
import { formatDistanceToNow } from '#imports'

type Notification = any

const systemNotificationStore = useNotificationStore()
const emptyNotification = ref(false)
const location = ref('bottom end' as const)
const badgeProps = ref<object>({})
const notificationQuery = ref({
  page: 1,
  limit: 5,
  keyword: '',
  sortAsc: false,
  sortBy: 'created_at',
})
const notifications = ref<Notification[]>([])
const notificationVisible = ref(false)

const { data, refresh: fetchNotifications } = await useLazyAsyncData(() => systemNotificationStore.fetchNotifications(notificationQuery.value), {
  default: () => ([] as Notification[]),
})
notifications.value.push(...data.value)

const { data: unreadNotifications, refresh: fetchUnreadNotifications } = await useLazyAsyncData(() => systemNotificationStore.countUnreadNotifications(), {
  default: () => ({ total: 0 }),
})
const { refresh: markAllUnread } = await useLazyAsyncData(() => systemNotificationStore.markAllUnread(), {
  default: () => ({}),
  immediate: false,
})
const { refresh: markAllRead } = await useLazyAsyncData(() => systemNotificationStore.markAllRead(), {
  default: () => ({}),
  immediate: false,
})

async function fetchMoreNotifications({ done }: { done: (type: 'ok' | 'empty' | 'loading' | 'error') => void }) {
  try {
    if (emptyNotification.value) {
      return done('empty')
    }

    if (!notifications.value.length) {
      emptyNotification.value = true
      return done('empty')
    }
    notificationQuery.value.page++

    await fetchNotifications()
    notifications.value.push(...data.value)

    if (!data || data.value?.length === 0) {
      emptyNotification.value = true
      return done('empty')
    }

    return done('ok')
  }
  catch {
    done('error')
  }
}

async function removeNotification(notificationId: string) {
  try {
    await systemNotificationStore.deleteNotification(notificationId)

    notifications.value.forEach((item, index) => {
      if (notificationId === item.id) {
        notifications.value.splice(index, 1)
      }
    })
  }
  catch (error) {
    console.error(error)
  }
}

async function handleNotificationClick(notification: Notification) {
  try {
    if (!notification.read_at) {
      await systemNotificationStore.markRead(notification.id)
    }
    else {
      await systemNotificationStore.markUnread(notification.id)
    }

    for (const item of notifications.value) {
      if (notification.id === item.id) {
        item.read_at = !notification.read_at ? new Date().toDateString() : null
        break
      }
    }
    fetchUnreadNotifications()
  }
  catch (error) {
    console.error(error)
  }
}

const isAllMarkRead = computed(() => unreadNotifications.value.total === 0)

async function handleMarkAllReadOrUnread() {
  try {
    if (isAllMarkRead.value) {
      markAllUnread()
    }
    else {
      markAllRead()
    }
    notifications.value.forEach((item) => {
      item.read_at = !isAllMarkRead.value ? new Date().toDateString() : null
    })
    fetchUnreadNotifications()
  }
  catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <IconBtn id="notification-btn">
    <VBadge
      dot
      v-bind="badgeProps"
      :model-value="!isAllMarkRead"
      color="error"
      bordered
      offset-x="1"
      offset-y="1"
      class="notification-badge"
    >
      <VIcon icon="ri-notification-2-line" />
    </VBadge>

    <VMenu
      v-model="notificationVisible"
      activator="parent"
      width="380"
      offset="15px"
      :location="location"
      :close-on-content-click="false"
    >
      <VCard class="d-flex flex-column">
        <!-- 👉 Header -->
        <VCardItem class="notification-section">
          <h6 class="text-h6 text-truncate">
            {{ $t('Notifications') }}
          </h6>

          <template #append>
            <VChip
              v-show="!isAllMarkRead"
              size="small"
              class="me-2"
              variant="tonal"
              color="primary"
            >
              {{ unreadNotifications?.total }} {{ $t('Unread') }}
            </VChip>

            <IconBtn
              v-show="notifications?.length"
              size="small"
              @click="handleMarkAllReadOrUnread"
            >
              <VIcon
                color="high-emphasis"
                :icon="!isAllMarkRead ? 'ri-mail-line' : 'ri-mail-open-line' "
              />

              <VTooltip
                activator="parent"
                location="start"
              >
                {{ isAllMarkRead ? $t('Mark all as unread') : $t('Mark all as read') }}
              </VTooltip>
            </IconBtn>
          </template>
        </VCardItem>

        <VDivider />
        <VInfiniteScroll
          :max-height="300"
          :items="notifications"
          :empty-text="!notifications?.length ? $t('No Notification Found!') : $t('No more notifications')"

          @load="fetchMoreNotifications"
        >
          <template
            v-for="(notification, index) in notifications"
            :key="notification.title"
          >
            <VDivider v-if="index > 0" />
            <VListItem
              link
              lines="one"
              min-height="66px"
              class="list-item-hover-class py-3 px-4"
              @click="handleNotificationClick(notification)"
            >
              <!-- Slot: Prepend -->
              <div class="d-flex align-start gap-3">
                <div>
                  <div class="text-body-2 text-high-emphasis font-weight-medium mb-1">
                    {{ notification.title }}
                  </div>
                  <p
                    class="text-caption mb-2 text-medium-emphasis "
                    style="letter-spacing: 0.4px !important; line-height: 18px;"
                  >
                    {{ notification.message }}
                  </p>
                  <p
                    class="text-caption mb-0"
                    style="letter-spacing: 0.4px !important; line-height: 18px;"
                  >
                    {{ formatDistanceToNow(notification.created_at) }}
                  </p>
                </div>
                <VSpacer />
                <div class="d-flex flex-column align-end gap-2">
                  <VIcon
                    :color="!notification.read_at ? 'primary' : 'secondary'"
                    :class="`${notification.read_at ? 'visible-in-hover' : ''} ms-1`"
                    size="10"
                    icon="ri-circle-fill"
                    @click.stop="handleNotificationClick(notification)"
                  />

                  <div style="block-size: 20px; inline-size: 20px;">
                    <VIcon
                      size="20"
                      icon="ri-close-line"
                      color="medium-emphasis"
                      class="visible-in-hover"
                      @click="removeNotification(notification.id)"
                    />
                  </div>
                </div>
              </div>
            </VListItem>
          </template>
        </VInfiniteScroll>

        <VDivider />

        <!-- 👉 Footer -->
        <VCardText
          v-show="notifications?.length"
          class="pa-2"
        />
      </VCard>
    </VMenu>
  </IconBtn>
</template>

<style lang="scss">
.notification-section {
  padding-block: 12px !important;
  padding-inline: 16px !important;
}

.list-item-hover-class {
  .visible-in-hover {
    display: none;
  }

  &:hover {
    .visible-in-hover {
      display: block;
    }
  }
}

.notification-badge {
  &.v-badge--bordered.v-badge--dot .v-badge__badge::after {
    color: rgb(var(--v-theme-background));
  }
}
</style>
