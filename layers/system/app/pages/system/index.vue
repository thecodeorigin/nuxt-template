<script setup lang="ts">
definePageMeta({
  can: ['system:manage'],
  middleware: () => navigateTo('/system/notifications', { replace: true }),
})
</script>

<template>
  <div />
</template>
