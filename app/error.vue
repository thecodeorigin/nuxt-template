<script setup lang="ts">
import type { NuxtError } from 'nuxt/app'

defineOptions({
  inheritAttrs: false,
})

defineProps<{
  error: NuxtError
}>()
</script>

<template>
  <ErrorNotFound v-if="error?.statusCode === 404" />
  <ErrorUnauthorized v-if="error?.statusCode === 403 || error?.statusCode === 401" />
  <ErrorUnderMaintenance v-if="error?.statusCode === 503" />
  <ErrorInternalServerError v-else :error="error" />
</template>
