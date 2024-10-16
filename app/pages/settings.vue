<script setup lang="ts">
definePageMeta({
  sidebar: {
    order: 99,
    title: 'Settings',
    icon: { icon: 'ri-settings-3-line' },
  },
  middleware(to) {
    if (to.name === 'settings')
      return navigateTo({ name: 'settings-tab', params: { tab: 'account' } })
  },
})

const { t } = useI18n()

const route = useRoute()

if (route.meta.sidebar)
  route.meta.sidebar.title = t('Settings')
</script>

<template>
  <div>
    <NuxtPage />
  </div>
</template>
