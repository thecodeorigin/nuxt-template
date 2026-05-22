<script setup lang="ts">
import NotificationsBell from '#layers/notifications/app/components/Notifications/NotificationsBell.vue'

defineProps<{ title?: string }>()
</script>

<template>
  <UDashboardNavbar :title="title">
    <template #leading>
      <UDashboardSidebarCollapse />
    </template>
    <template #right>
      <slot name="right" />
      <ClientOnly>
        <NotificationsBell />
      </ClientOnly>
    </template>
  </UDashboardNavbar>
</template>
