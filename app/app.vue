<script setup lang="ts">
const config = useRuntimeConfig()
const colorMode = useColorMode()
const { t } = useI18n()
const color = computed(() => colorMode.value === 'dark' ? config.public.theme.darkColor : config.public.theme.lightColor)

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color },
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
  ],
  htmlAttrs: {
    lang: 'en',
  },
})

useSeoMeta({
  ogImage: '/social-card.png',
  twitterImage: '/social-card.png',
  twitterCard: 'summary_large_image',
})

const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation('docs'), {
  transform: data => data.find(item => item.path === '/docs')?.children || [],
})
const { data: files } = useLazyAsyncData('search', () => queryCollectionSearchSections('docs'), {
  server: false,
})

const links = [{
  label: t('Docs'),
  icon: 'i-lucide-book',
  to: '/docs/getting-started',
}, {
  label: t('Pricing'),
  icon: 'i-lucide-credit-card',
  to: '/pricing',
}, {
  label: t('Blog'),
  icon: 'i-lucide-pencil',
  to: '/blog',
}]

provide('navigation', navigation)
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        shortcut="meta_k"
        :navigation="navigation"
        :links="links"
        :fuse="{ resultLimit: 42 }"
      />
    </ClientOnly>
  </UApp>
</template>
