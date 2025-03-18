<script setup lang="ts">
const { isNotificationsSlideoverOpen } = useDashboard()
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Dashboard" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UTooltip text="Notifications" :shortcuts="['N']">
            <UButton
              color="neutral"
              variant="ghost"
              square
              @click="isNotificationsSlideoverOpen = true"
            >
              <UChip color="error" inset>
                <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
              </UChip>
            </UButton>
          </UTooltip>

          <UTooltip text="Create new instance" :popper="{ placement: 'right' }">
            <UButton
              trailing-icon="i-heroicons-plus"
              color="neutral"
            >
              Create
            </UButton>
          </UTooltip>
        </template>
      </UDashboardNavbar>
    </template>
  </UDashboardPanel>
</template>
