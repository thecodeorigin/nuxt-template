<script setup lang="ts">
definePageMeta({
  middleware: defineNuxtRouteMiddleware(() => navigateTo('/dashboard', { replace: true })),
})
</script>

<template>
  <div />
</template>
