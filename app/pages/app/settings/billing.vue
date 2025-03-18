<script setup lang="ts">
useHead({
  title: 'Billing Information',
})
</script>

<template>
  <UPageCard
    title="Billing Information"
    description="Please manage your billing information so your service is not interrupted."
    variant="subtle"
  >
    <BillingCreditCard />

    <BillingSubscriptionCard />
  </UPageCard>
</template>
