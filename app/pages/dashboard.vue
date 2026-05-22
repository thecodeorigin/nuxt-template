<script setup lang="ts">
import DashboardGettingStarted from '~/components/Dashboard/DashboardGettingStarted.vue'
import DashboardNavbar from '~/components/Dashboard/DashboardNavbar.vue'
import DashboardSessionCard from '~/components/Dashboard/DashboardSessionCard.vue'

useHead({ title: 'Dashboard' })
</script>

<template>
  <UDashboardPanel id="dashboard">
    <template #header>
      <DashboardNavbar title="Home" />
    </template>

    <template #body>
      <div class="space-y-6">
        <DashboardSessionCard />
        <DashboardGettingStarted />
      </div>
    </template>
  </UDashboardPanel>
</template>
