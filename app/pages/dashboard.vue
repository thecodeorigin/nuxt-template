<script setup lang="ts">
definePageMeta({
  sidebar: {
    order: 0,
    title: 'Dashboard',
    icon: { icon: 'ri-dashboard-2-line' },
  },
})

const { t } = useI18n()

const route = useRoute()

if (route.meta.sidebar)
  route.meta.sidebar.title = t('Dashboard')

onMounted(async () => {
  try {
    await confirmation({
      body: 'Hehe',
    })

    console.log('Confirmed')
  }
  catch (error) {
    console.log('Hehe', error)
  }
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
