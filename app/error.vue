<script setup lang="ts">
import { match } from 'ts-pattern'
import type { NuxtError } from '#app'

const props = defineProps({
  error: {
    type: Object as PropType<NuxtError>,
    required: true,
  },
})

useSeoMeta({
  title: props.error.statusMessage || 'Error',
  description: props.error.message || 'We are sorry but an error has occurred',
})

useHead({
  htmlAttrs: {
    lang: 'en',
  },
})

const errorName = computed(() => {
  return match(props.error.statusCode)
    .with(404, () => 'Page not found!')
    .with(401, () => 'You are not authorized!')
    .with(403, () => 'You are not authorized!')
    .otherwise(() => 'An error has occurred')
})

const errorMessage = computed(() => {
  return match(props.error.statusCode)
    .with(404, () => 'The page you are looking for could not be found')
    .with(401, () => 'You do not have permission to access this page! Please contact the administrator to resolve this problem.')
    .with(403, () => 'You do not have permission to access this page! Please contact the administrator to resolve this problem.')
    .otherwise(() => props.error.message + (import.meta.env.DEV ? props.error.stack : ''))
})

const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation('docs'), {
  transform: data => data.find(item => item.path === '/docs')?.children || [],
})
const { data: files } = useLazyAsyncData('search', () => queryCollectionSearchSections('docs'), {
  server: false,
})

const links = [{
  label: 'Docs',
  icon: 'i-lucide-book',
  to: '/docs/getting-started',
}, {
  label: 'Pricing',
  icon: 'i-lucide-credit-card',
  to: '/pricing',
}, {
  label: 'Blog',
  icon: 'i-lucide-pencil',
  to: '/blog',
}]
</script>

<template>
  <div>
    <AppHeader />

    <UMain>
      <UContainer>
        <UPage>
          <UError
            :error="{
              statusCode: error.statusCode,
              statusMessage: errorName,
              message: errorMessage,
            }"
          />
        </UPage>
      </UContainer>
    </UMain>

    <AppFooter />

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        shortcut="meta_k"
        :navigation="navigation"
        :links="links"
        :fuse="{ resultLimit: 42 }"
      />
    </ClientOnly>

    <UToaster />
  </div>
</template>
