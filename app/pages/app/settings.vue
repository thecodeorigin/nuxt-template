<script setup lang="ts">
definePageMeta({
  sidebar: {
    label: 'Settings',
    icon: 'i-heroicons-cog-8-tooth',
    tooltip: {
      text: 'Settings',
      shortcuts: ['G', 'S'],
    },
  },
})

const links = [
  [
    {
      label: 'General',
      icon: 'i-heroicons-user-circle',
      to: '/app/settings',
      exact: true,
    },
    {
      label: 'Members',
      icon: 'i-heroicons-user-group',
      to: '/app/settings/members',
    },
    {
      label: 'Notifications',
      icon: 'i-heroicons-bell',
      to: '/app/settings/notifications',
    },
  ],
  [
    {
      label: 'Documentation',
      icon: 'i-heroicons-book-open',
      to: 'https://ui.nuxt.com/pro',
      target: '_blank',
    },
  ],
]
</script>

<template>
  <div class="flex flex-col w-full h-full">
    <UDashboardToolbar class="py-0 px-1.5 overflow-x-auto">
      <UHorizontalNavigation :links="links" />
    </UDashboardToolbar>

    <NuxtPage />
  </div>
</template>
