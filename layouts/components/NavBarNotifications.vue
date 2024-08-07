<script lang="ts" setup>
import type { Tables } from '@/server/types/supabase.js'

type Notification = Tables<'sys_notifications'>
// const notifications = ref<Array<Notification>>([])

const location = ref('bottom end' as const)
const badgeProps = ref<object>({})
const notifications = ref<Notification[]>([])
const notificationQuery = ref({
  offset: 0,
  limit: 5,
})
const notificationVisible = ref(false)

async function fetchNotifications() {
  try {
    return await $api<Notification[]>('/pages/notifications', {
      method: 'GET',
      query: notificationQuery.value,
    })
  }
  catch (error) {
    console.error(error)
  }
}

watch(notificationVisible, async (visible) => {
  if (visible) {
    notificationQuery.value.offset = 0

    const response = await fetchNotifications()

    if (response)
      notifications.value = response
  }
})

async function fetchMoreNotifications({ done }: { done: (type: 'ok' | 'empty' | 'loading' | 'error') => void }) {
  try {
    if (!notifications.value?.length)
      return done('empty')

    notificationQuery.value.offset += notificationQuery.value.limit

    const nextNotifications = await fetchNotifications()

    if (!nextNotifications || nextNotifications?.length === 0)
      return done('empty')

    notifications.value?.push(...nextNotifications)

    return done('ok')
  }
  catch {
    done('error')
  }
}

async function removeNotification(notificationId: string) {
  try {
    await $api(`/pages/notifications/${notificationId}`, { method: 'DELETE' })
    notifications.value?.forEach((item, index) => {
      if (notificationId === item.id) {
        notifications.value?.splice(index, 1)
      }
    })
  }
  catch (error) {
    console.error(error)
  }
}

async function markReadOrUnread(notificationId: string, type: 'read' | 'unread') {
  try {
    await $api(`/pages/notifications/${notificationId}`, { method: 'PATCH', body: { read_at: type === 'read' ? new Date() : null } })
    notifications.value?.forEach((item) => {
      if (notificationId === item.id) {
        item.read_at = type === 'read' ? new Date().toDateString() : null
      }
    })
  }
  catch (error) {
    console.error(error)
  }
}
async function markAllReadOrUnread(type: 'read' | 'unread') {
  try {
    const read = type === 'read'
    await $api(`/pages/notifications/${read ? 'mark-all-read' : 'mark-all-unread'}`, { method: 'PATCH', body: { read_at: read ? new Date() : null },
    })
    notifications.value?.forEach((item) => {
      item.read_at = read ? new Date().toDateString() : null
    })
  }
  catch (error) {
    console.error(error)
  }
}

function handleNotificationClick(notification: Notification) {
  if (!notification.read_at)
    markReadOrUnread(notification.id, 'read')
  else
    markReadOrUnread(notification.id, 'unread')
}
const totalUnreadNotifications = computed(() => notifications.value?.filter(item => !item.read_at).length)
const isAllMarkRead = computed(() => notifications.value?.every(item => item.read_at))
function handleMarkAllReadOrUnread() {
  if (isAllMarkRead.value)
    markAllReadOrUnread('unread')
  else
    markAllReadOrUnread('read')
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
            Notifications
          </h6>

          <template #append>
            <VChip
              v-show="!isAllMarkRead"
              size="small"
              class="me-2"
              variant="tonal"
              color="primary"
            >
              {{ totalUnreadNotifications }} unread
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
                {{ isAllMarkRead ? 'Mark all as unread' : 'Mark all as read' }}
              </VTooltip>
            </IconBtn>
          </template>
        </VCardItem>

        <VDivider />
        <VInfiniteScroll
          :max-height="300"
          :items="notifications"
          :empty-text="!notifications?.length ? 'No Notification Found!' : 'No more notifications'"
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
                    {{ $formatCreatedAt(notification.created_at) }}
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
          class="pa-4"
        >
          <VBtn
            block
            size="small"
          >
            View All Notifications
          </VBtn>
        </VCardText>
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
