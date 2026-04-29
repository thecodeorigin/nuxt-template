<script setup lang="ts">
definePageMeta({ unauthenticatedOnly: true, layout: 'auth' })
useHead({ title: 'Sign in' })
</script>

<template>
  <AuthLoginCard />
</template>
