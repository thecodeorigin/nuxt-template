<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { satisfiesAbility } from '#layers/auth/shared/ability'
import DashboardNavbar from '~/components/Dashboard/DashboardNavbar.vue'

useHead({ title: 'Settings' })

const authStore = useAuthStore()
const abilities = computed(() => authStore.currentUser?.abilities ?? [])

const links = computed(() => [[
  {
    label: 'General',
    icon: 'i-lucide-user',
    to: '/settings',
    exact: true,
  },
  ...(satisfiesAbility(abilities.value, 'billing:read')
    ? [{ label: 'Billing', icon: 'i-lucide-credit-card', to: '/settings/billing' }]
    : []
  ),
  {
    label: 'Notifications',
    icon: 'i-lucide-bell',
    to: '/settings/notifications',
  },
  {
    label: 'Security',
    icon: 'i-lucide-shield',
    to: '/settings/security',
  },
], [
  {
    label: 'Documentation',
    icon: 'i-lucide-book-open',
    to: 'https://ui.nuxt.com/docs/getting-started/installation/nuxt',
    target: '_blank',
  },
]] satisfies NavigationMenuItem[][])
</script>

<template>
  <UDashboardPanel id="settings" :ui="{ body: 'lg:py-12' }">
    <template #header>
      <DashboardNavbar title="Settings" />
      <UDashboardToolbar>
        <UNavigationMenu :items="links" highlight class="-mx-1 flex-1" />
      </UDashboardToolbar>
    </template>
    <template #body>
      <div class="flex flex-col gap-4 sm:gap-6 lg:gap-12 w-full lg:max-w-2xl mx-auto">
        <NuxtPage />
      </div>
    </template>
  </UDashboardPanel>
</template>
