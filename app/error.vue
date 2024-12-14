<script setup lang="ts">
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

const errorMessage = computed(() => {
  return props.error.message + (import.meta.env.DEV ? props.error.stack : '')
})
</script>

<template>
  <div>
    <UMain>
      <UContainer>
        <UPage>
          <UPageError
            :name="error.name"
            :message="errorMessage"
            :status="error.statusCode"
          />
        </UPage>
      </UContainer>
    </UMain>

    <UNotifications />
  </div>
</template>
