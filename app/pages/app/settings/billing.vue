<script setup lang="ts">
const { t } = useI18n()
useHead({
  title: t('Billing Information'),
})
</script>

<template>
  <UPageCard
    :title="$t('Billing Information')"
    :description="$t('Please manage your billing information so your service is not interrupted.')"
    variant="subtle"
  >
    <BillingCreditCard />

    <BillingSubscriptionCard />
  </UPageCard>
</template>
