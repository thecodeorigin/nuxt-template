<script setup lang="ts">
definePageMeta({
  action: 'manage',
  subject: 'user',
  sidebar: {
    title: 'Users & Permissions',
    icon: { icon: 'ri-admin-line' },
  },
  middleware(to) {
    if (to.name === 'admin')
      return navigateTo({ name: 'admin-users' })
  },
})

const { t } = useI18n()

const route = useRoute()

if (route.meta.sidebar)
  route.meta.sidebar.title = t('Users & Permissions')
</script>

<template>
  <div>
    <NuxtPage />
  </div>
</template>
