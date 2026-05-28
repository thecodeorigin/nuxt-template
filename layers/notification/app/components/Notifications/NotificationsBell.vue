<script setup lang="ts">
import { useNotificationStore } from '#layers/notification/app/stores/notifications'

const store = useNotificationStore()

onMounted(() => {
  void store.refreshUnreadCount()
})
</script>

<template>
  <UButton
    color="neutral"
    variant="ghost"
    square
    aria-label="Notifications"
    data-testid="notifications-bell"
    @click="store.open()"
  >
    <UChip color="error" :show="store.unreadCount > 0" inset>
      <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
    </UChip>
  </UButton>
</template>
