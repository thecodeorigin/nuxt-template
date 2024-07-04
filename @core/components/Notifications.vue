<script lang="ts" setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import type { Notification } from '@layouts/types'

interface Props {
  notifications: Notification[]
  badgeProps?: object
  location?: any
}
interface Emit {
  (e: 'read', value: number[]): void
  (e: 'unread', value: number[]): void
  (e: 'remove', value: number): void
  (e: 'click:notification', value: Notification): void
}

const props = withDefaults(defineProps<Props>(), {
  location: 'bottom end',
  badgeProps: undefined,
})

const emit = defineEmits<Emit>()

const isAllMarkRead = computed(() => props.notifications.some(item => item.isSeen === false),
)

const markAllReadOrUnread = () => {
  const allNotificationsIds = props.notifications.map(item => item.id)

  if (!isAllMarkRead.value)
    emit('unread', allNotificationsIds)
  else
    emit('read', allNotificationsIds)
}

const totalUnreadNotifications = computed(() => props.notifications.filter(item => !item.isSeen).length)
</script>

<template>
  <IconBtn id="notification-btn">
    <VBadge
      dot
      v-bind="props.badgeProps"
      :model-value="props.notifications.some(n => !n.isSeen)"
      color="error"
      bordered
      offset-x="1"
      offset-y="1"
      class="notification-badge"
    >
      <VIcon icon="ri-notification-2-line" />
    </VBadge>

    <VMenu
      activator="parent"
      width="380"
      :location="props.location"
      offset="15px"
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
              v-show="!!isAllMarkRead"
              size="small"
              class="me-2"
              variant="tonal"
              color="primary"
            >
              {{ totalUnreadNotifications }} new
            </VChip>

            <IconBtn
              v-show="props.notifications.length"
              size="small"
              @click="markAllReadOrUnread"
            >
              <VIcon
                color="high-emphasis"
                :icon="!isAllMarkRead ? 'ri-mail-line' : 'ri-mail-open-line' "
              />

              <VTooltip
                activator="parent"
                location="start"
              >
                {{ !isAllMarkRead ? 'Mark all as unread' : 'Mark all as read' }}
              </VTooltip>
            </IconBtn>
          </template>
        </VCardItem>

        <VDivider />

        <!-- 👉 Notifications list -->
        <PerfectScrollbar
          :options="{ wheelPropagation: false }"
          style="max-block-size: 27rem;"
        >
          <VList class="py-0">
            <template
              v-for="(notification, index) in props.notifications"
              :key="notification.title"
            >
              <VDivider v-if="index > 0" />
              <VListItem
                link
                lines="one"
                min-height="66px"
                class="list-item-hover-class py-3 px-4"
                @click="$emit('click:notification', notification)"
              >
                <!-- Slot: Prepend -->
                <!-- Handles Avatar: Image, Icon, Text -->
                <div class="d-flex align-start gap-3">
                  <VAvatar
                    size="40"
                    :color="notification.color && !notification.img ? notification.color : undefined"
                    :variant="notification.img ? undefined : 'tonal' "
                  >
                    <span v-if="notification.text">{{ avatarText(notification.text) }}</span>

                    <VImg
                      v-if="notification.img"
                      :src="notification.img"
                    />

                    <VIcon
                      v-if="notification.icon"
                      :icon="notification.icon"
                    />
                  </VAvatar>

                  <div>
                    <div class="text-body-2 text-high-emphasis font-weight-medium mb-1">
                      {{ notification.title }}
                    </div>
                    <p
                      class="text-caption mb-2 text-medium-emphasis"
                      style="letter-spacing: 0.4px !important; line-height: 18px;"
                    >
                      {{ notification.subtitle }}
                    </p>
                    <p
                      class="text-caption mb-0"
                      style="letter-spacing: 0.4px !important; line-height: 18px;"
                    >
                      {{ notification.time }}
                    </p>
                  </div>

                  <VSpacer />

                  <div class="d-flex flex-column align-end gap-2">
                    <VIcon
                      :color="!notification.isSeen ? 'primary' : 'secondary'"
                      :class="`${notification.isSeen ? 'visible-in-hover' : ''} ms-1`"
                      size="10"
                      icon="ri-circle-fill"
                      @click.stop="$emit(notification.isSeen ? 'unread' : 'read', [notification.id])"
                    />

                    <div style="block-size: 20px; inline-size: 20px;">
                      <VIcon
                        size="20"
                        icon="ri-close-line"
                        color="medium-emphasis"
                        class="visible-in-hover"
                        @click="$emit('remove', notification.id)"
                      />
                    </div>
                  </div>
                </div>
              </VListItem>
            </template>

            <VListItem
              v-show="!props.notifications.length"
              class="text-center text-medium-emphasis"
              style="block-size: 56px;"
            >
              <VListItemTitle>No Notification Found!</VListItemTitle>
            </VListItem>
          </VList>
        </PerfectScrollbar>

        <VDivider />

        <!-- 👉 Footer -->
        <VCardText
          v-show="props.notifications.length"
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
