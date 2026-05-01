<script setup lang="ts">
import DashboardGettingStarted from '~/components/Dashboard/DashboardGettingStarted.vue'
import DashboardSessionCard from '~/components/Dashboard/DashboardSessionCard.vue'

useHead({ title: 'Dashboard' })
</script>

<template>
  <UDashboardPanel id="dashboard">
    <template #header>
      <UDashboardNavbar title="Home">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-6">
        <DashboardSessionCard />
        <DashboardGettingStarted />
      </div>
    </template>
  </UDashboardPanel>
</template>
