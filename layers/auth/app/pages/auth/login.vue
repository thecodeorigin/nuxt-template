<script setup lang="ts">
import AuthLoginCard from '#layers/auth/app/components/Auth/AuthLoginCard.vue'

definePageMeta({ unauthenticatedOnly: true, layout: 'auth' })
useHead({ title: 'Sign in' })
</script>

<template>
  <AuthLoginCard />
</template>
