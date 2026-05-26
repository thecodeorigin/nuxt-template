<script setup lang="ts">
import type { CommandPaletteItem, NavigationMenuItem } from '@nuxt/ui'
import ImpersonateMenu from '#layers/auth/app/components/Impersonate/ImpersonateMenu.vue'
import OrganizationMenu from '#layers/auth/app/components/Organization/OrganizationMenu.vue'
import UserMenu from '#layers/auth/app/components/User/UserMenu.vue'
import { satisfiesAbility } from '#layers/auth/shared/ability'
import NotificationsSlideover from '#layers/notifications/app/components/Notifications/NotificationsSlideover.vue'
import SupportFeedbackModal from '#layers/support/app/components/Support/SupportFeedbackModal.vue'
import SupportTicketModal from '#layers/support/app/components/Support/SupportTicketModal.vue'

const open = ref(false)
const colorMode = useColorMode()
const authStore = useAuthStore()
const feedbackModalOpen = ref(false)
const supportModalOpen = ref(false)

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
    { label: 'Projects', icon: 'i-lucide-folder-kanban', to: '/projects', onSelect: closeMenu },
    { label: 'Referral', icon: 'i-lucide-gift', to: '/referral', onSelect: closeMenu },
    { label: 'My Requests', icon: 'i-lucide-inbox', to: '/support', onSelect: closeMenu },
  ]

  if (satisfiesAbility(abilities.value, 'product:manage') || satisfiesAbility(abilities.value, 'product:write')) {
    main.splice(2, 0, { label: 'Products', icon: 'i-lucide-package', to: '/products', onSelect: closeMenu })
  }

  const sub: NavigationMenuItem[] = []

  main.push({
    label: 'Settings',
    icon: 'i-lucide-settings',
    defaultOpen: true,
    type: 'trigger' as const,
    children: [
      { label: 'General', to: '/settings', exact: true, onSelect: closeMenu },
      ...(satisfiesAbility(abilities.value, 'billing:read')
        ? [
            { label: 'Billing', to: '/settings/billing', onSelect: closeMenu },
            { label: 'Invoice', to: '/organization/invoice', onSelect: closeMenu },
          ]
        : []
      ),
      { label: 'Notifications', to: '/settings/notifications', onSelect: closeMenu },
      { label: 'Security', to: '/settings/security', onSelect: closeMenu },
    ],
  })

  if (satisfiesAbility(abilities.value, 'system:manage')) {
    const sysChildren: NavigationMenuItem[] = [
      { label: 'Notifications', to: '/system/notifications', onSelect: closeMenu },
    ]
    if (satisfiesAbility(abilities.value, 'support:manage')) {
      sysChildren.push({ label: 'Tickets', to: '/system/tickets', onSelect: closeMenu })
    }
    sub.push({
      label: 'System Administration',
      icon: 'i-lucide-shield-check',
      defaultOpen: true,
      type: 'trigger' as const,
      children: sysChildren,
    })
  } else {
    sub.push(
      {
        label: 'Feedback',
        icon: 'i-lucide-message-circle',
        onSelect() {
          feedbackModalOpen.value = true
          closeMenu()
        },
      },
      {
        label: 'Help & Support',
        icon: 'i-lucide-info',
        onSelect() {
          supportModalOpen.value = true
          closeMenu()
        },
      },
    )
  }

  return [main, sub]
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

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          popover
          class="mt-auto"
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
      <SupportFeedbackModal v-model:open="feedbackModalOpen" />
      <SupportTicketModal v-model:open="supportModalOpen" />
    </ClientOnly>
  </UDashboardGroup>
</template>
