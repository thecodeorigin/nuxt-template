<script setup lang="ts">
definePageMeta({
  sidebar: {
    order: 1,
    label: 'Pricing',
    icon: 'i-heroicons-currency-dollar',
    exact: true,
  },
})

const stripeStore = useStripeStore()
const subscriptionStore = useSubscriptionStore()
subscriptionStore.fetchSubscriptions()
stripeStore.fetchStripeProductPrices()
// await useAsyncData('stripePrices', () => stripeStore.fetchStripeProductPrices(), { default: () => [] })
// await useAsyncData('subscriptions', () => subscriptionStore.fetchSubscriptions(), { default: () => [] })
</script>

<template>
  <UDashboardPanelContent class="pb-24 pt-10">
    <!--  -->
    <div class="flex flex-col items-center">
      <PricingPlan
        title="A plan for every need"
        description="Our plans are designed to meet the requirements of both beginners and players. Get the right plan that suits you."
        :stripe-prices="stripeStore.stripePrices"
      />
    </div>
  </UDashboardPanelContent>
</template>
