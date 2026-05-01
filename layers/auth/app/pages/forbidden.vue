<script setup lang="ts">
definePageMeta({ public: true })
useHead({ title: 'Forbidden' })
</script>

<template>
  <UContainer class="py-24">
    <div class="max-w-md mx-auto text-center space-y-4">
      <UIcon name="i-lucide-lock" class="size-12 text-muted mx-auto" />
      <h1 class="text-3xl font-bold text-highlighted">
        403 — Forbidden
      </h1>
      <p class="text-muted">
        You don't have permission to view this page.
      </p>
      <UButton to="/" icon="i-lucide-home">
        Back home
      </UButton>
    </div>
  </UContainer>
</template>
