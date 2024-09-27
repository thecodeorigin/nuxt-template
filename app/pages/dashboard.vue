<script setup lang="ts">
definePageMeta({
  sidebar: {
    order: 0,
    title: 'Dashboard',
    icon: { icon: 'ri-dashboard-2-line' },
  },
})
</script>

<template>
  <div data-test="dashboard">
    <VCard title="Welcome to Nuxt Dashboard">
      <VCardText>We carefully crafted JWT flow so you can implement JWT with ease and with minimum efforts.</VCardText>
      <VCardText>Please read our  JWT Documentation to get more out of JWT authentication.</VCardText>
    </VCard>
  </div>
</template>
