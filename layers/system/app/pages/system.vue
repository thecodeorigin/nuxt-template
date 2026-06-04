<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import DashboardNavbar from '~/components/Dashboard/DashboardNavbar.vue'

definePageMeta({ can: ['system:manage'] })
useHead({ title: 'System Administration' })

const { $ability } = useNuxtApp()

const links = computed<NavigationMenuItem[][]>(() => {
  const items: NavigationMenuItem[] = []
  if ($ability.can('manage', 'system'))
    items.push({ label: 'Notifications', icon: 'i-lucide-send', to: '/system/notifications' })
  if ($ability.can('manage', 'support'))
    items.push({ label: 'Tickets', icon: 'i-lucide-ticket', to: '/system/tickets' })
  return [items]
})
</script>

<template>
  <UDashboardPanel id="system">
    <template #header>
      <DashboardNavbar title="System Administration" />
      <UDashboardToolbar>
        <UNavigationMenu :items="links" highlight class="-mx-1 flex-1" />
      </UDashboardToolbar>
    </template>
    <template #body>
      <div class="flex flex-col gap-4 sm:gap-6 lg:gap-12 w-full">
        <NuxtPage />
      </div>
    </template>
  </UDashboardPanel>
</template>
