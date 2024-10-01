<script setup lang="ts">
definePageMeta({
  sidebar: {
    order: 1,
    title: 'Projects',
    icon: { icon: 'ri-clapperboard-line' },
  },
})

const { t } = useI18n()

const route = useRoute()

if (route.meta.sidebar)
  route.meta.sidebar.title = t('Projects')
</script>

<template>
  <NuxtPage />
</template>
