<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { satisfiesAbility } from '#layers/auth/shared/ability'
import DashboardNavbar from '~/components/Dashboard/DashboardNavbar.vue'

definePageMeta({ can: ['user:read'] })
useHead({ title: 'Organization' })

const authStore = useAuthStore()
const abilities = computed(() => authStore.currentUser?.abilities ?? [])

const links = computed(() => {
  const items: NavigationMenuItem[] = [
    { label: 'General', icon: 'i-lucide-building', to: '/organization', exact: true },
    { label: 'Members', icon: 'i-lucide-users', to: '/organization/members' },
    { label: 'Roles', icon: 'i-lucide-shield', to: '/organization/roles' },
  ]
  if (satisfiesAbility(abilities.value, 'billing:read'))
    items.push({ label: 'Invoice', icon: 'i-lucide-file-text', to: '/organization/invoice' })
  return [items]
})
</script>

<template>
  <UDashboardPanel id="organization" :ui="{ body: 'lg:py-12' }">
    <template #header>
      <DashboardNavbar title="Organization" />
      <UDashboardToolbar>
        <UNavigationMenu :items="links" highlight class="-mx-1 flex-1" />
      </UDashboardToolbar>
    </template>
    <template #body>
      <div class="flex flex-col gap-4 sm:gap-6 lg:gap-12 w-full lg:max-w-4xl mx-auto">
        <NuxtPage />
      </div>
    </template>
  </UDashboardPanel>
</template>
