<script setup lang="ts">
const toast = useToast()

const open = ref(false)

const config = useRuntimeConfig()

const links = [
  [
    {
      label: 'Dashboard',
      icon: 'i-lucide-monitor',
      to: '/app',
      exact: true,
      onSelect() {
        open.value = false
      },
    },
    {
      label: 'Settings',
      icon: 'i-lucide-settings',
      defaultOpen: true,
      children: [
        {
          label: 'Profile',
          to: '/app/settings/profile',
          exact: true,
          onSelect() {
            open.value = false
          },
        },
        {
          label: 'Billing',
          to: '/app/settings/billing',
          onSelect() {
            open.value = false
          },
        },
        {
          label: 'Notifications',
          to: '/app/settings/notifications',
          onSelect() {
            open.value = false
          },
        },
        {
          label: 'Security',
          to: '/app/settings/security',
          onSelect() {
            open.value = false
          },
        },
      ],
    },
  ],
  [
    {
      label: 'Feedback',
      icon: 'i-lucide-message-circle',
      to: config.public.appFeedbackUrl as string,
      target: '_blank',
    },
    {
      label: 'Help & Support',
      icon: 'i-lucide-info',
      to: config.public.appSupportUrl as string,
      target: '_blank',
    },
  ].filter(Boolean),
]

const groups = computed(() => [
  {
    id: 'links',
    label: 'Go to',
    items: links.flat(),
  },
])

const cookieConsent = useLocalStorage<'accepted' | null>('cookieConsent', null)

onMounted(async () => {
  if (cookieConsent.value === 'accepted')
    return

  toast.add({
    title: 'We use first-party cookies to enhance your experience on our website.',
    duration: 0,
    close: false,
    actions: [
      {
        label: 'Accept',
        color: 'neutral',
        variant: 'outline',
        onClick() {
          cookieConsent.value = 'accepted'
        },
      },
      {
        label: 'Opt out',
        color: 'neutral',
        variant: 'ghost',
      },
    ],
  })
})
</script>

<template>
  <UDashboardGroup>
    <UDashboardSearch :groups="groups" />

    <UDashboardSidebar
      v-model:open="open"
      collapsible
      resizable
      class="bg-(--ui-bg-elevated)/25"
      :ui="{ footer: 'lg:border-t lg:border-(--ui-border)' }"
    >
      <template #header="{ collapsed }">
        <TeamsMenu :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-(--ui-border)" />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <slot />

    <NotificationsSlideover />
  </UDashboardGroup>
</template>
