<script setup lang="ts">
import type { CommandPaletteItem, NavigationMenuItem } from '@nuxt/ui'
import ImpersonateMenu from '#layers/auth/app/components/Impersonate/ImpersonateMenu.vue'
import OrganizationMenu from '#layers/auth/app/components/Organization/OrganizationMenu.vue'
import UserMenu from '#layers/auth/app/components/User/UserMenu.vue'
import { satisfiesAbility } from '#layers/auth/shared/ability'
import NotificationsSlideover from '#layers/notifications/app/components/Notifications/NotificationsSlideover.vue'

const open = ref(false)
const colorMode = useColorMode()
const authStore = useAuthStore()

onMounted(() => {
  useCookieConsent().prompt()
})

function closeMenu() {
  open.value = false
}
function setTheme(pref: string) {
  colorMode.preference = pref
}

const abilities = computed(() => authStore.currentUser?.abilities ?? [])

const links = computed<NavigationMenuItem[][]>(() => {
  const main: NavigationMenuItem[] = [
    { label: 'Home', icon: 'i-lucide-house', to: '/dashboard', onSelect: closeMenu },
    { label: 'Todos', icon: 'i-lucide-list-todo', to: '/todos', onSelect: closeMenu },
  ]

  main.push({
    label: 'Settings',
    icon: 'i-lucide-settings',
    defaultOpen: true,
    type: 'trigger' as const,
    children: [
      { label: 'General', to: '/settings', exact: true, onSelect: closeMenu },
      ...(satisfiesAbility(abilities.value, 'user:read')
        ? [{ label: 'Organization', to: '/organization', onSelect: closeMenu }]
        : []
      ),
      { label: 'Notifications', to: '/settings/notifications', onSelect: closeMenu },
      { label: 'Security', to: '/settings/security', onSelect: closeMenu },
    ],
  })
  return [main]
})

const groups = computed(() => [{
  id: 'goto',
  label: 'Go to',
  items: links.value.flat().flatMap(i => (i.children?.length ? i.children : [i])) as CommandPaletteItem[],
}, {
  id: 'theme',
  label: 'Theme',
  items: [
    { label: 'System', icon: 'i-lucide-monitor', onSelect: () => setTheme('system') },
    { label: 'Light', icon: 'i-lucide-sun', onSelect: () => setTheme('light') },
    { label: 'Dark', icon: 'i-lucide-moon', onSelect: () => setTheme('dark') },
  ],
}])
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{
        header: 'lg:border-b lg:border-default',
        footer: 'lg:border-t lg:border-default',
        body: 'gap-2 py-4',
      }"
    >
      <template #header="{ collapsed }">
        <OrganizationMenu :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

        <ImpersonateMenu :collapsed="collapsed" />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <slot />

    <ClientOnly>
      <NotificationsSlideover />
    </ClientOnly>
  </UDashboardGroup>
</template>
