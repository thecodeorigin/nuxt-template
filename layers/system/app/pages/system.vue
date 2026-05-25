<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { satisfiesAbility } from '#layers/auth/shared/ability'
import DashboardNavbar from '~/components/Dashboard/DashboardNavbar.vue'

definePageMeta({ can: ['system:manage'] })
useHead({ title: 'System Administration' })

const authStore = useAuthStore()
const abilities = computed(() => authStore.currentUser?.abilities ?? [])

const links = computed<NavigationMenuItem[][]>(() => {
  const items: NavigationMenuItem[] = []
  if (satisfiesAbility(abilities.value, 'system:manage'))
    items.push({ label: 'Notifications', icon: 'i-lucide-send', to: '/system/notifications' })
  if (satisfiesAbility(abilities.value, 'support:manage'))
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
