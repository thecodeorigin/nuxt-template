<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import DashboardNavbar from '~/components/Dashboard/DashboardNavbar.vue'

definePageMeta({ can: ['system:manage'] })
useHead({ title: 'System Settings' })

const links = [[
  { label: 'Notifications', icon: 'i-lucide-send', to: '/system/notifications' },
]] satisfies NavigationMenuItem[][]
</script>

<template>
  <UDashboardPanel id="system" :ui="{ body: 'lg:py-12' }">
    <template #header>
      <DashboardNavbar title="System Settings" />
      <UDashboardToolbar>
        <UNavigationMenu :items="links" highlight class="-mx-1 flex-1" />
      </UDashboardToolbar>
    </template>
    <template #body>
      <div class="flex flex-col gap-4 sm:gap-6 lg:gap-12 w-full lg:max-w-3xl mx-auto">
        <NuxtPage />
      </div>
    </template>
  </UDashboardPanel>
</template>
