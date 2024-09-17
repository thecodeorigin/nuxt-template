<script setup lang="ts">
const props = defineProps<Pricing>()

const stripeStore = useStripeStore()
const subscriptionStore = useSubscriptionStore()

subscriptionStore.fetchSubscriptions()
stripeStore.fetchStripeProductPrices()

interface Pricing {
  title?: string
  cols?: number | string
  sm?: number | string
  md?: string | number
  lg?: string | number
  xl?: string | number
}

const pricingComputed = computed(() => {
  if (!stripeStore.stripePrices)
    return []

  const newArrayOfPrices = Object.values(stripeStore.stripePrices)[0]?.map((price) => {
    const isCurrentPlan = subscriptionStore.subscriptions.some(sub => sub.plan.id === price.id)
    return {
      ...price,
      current: isCurrentPlan,
    }
  })
  return newArrayOfPrices
})

async function handleSubscribe(priceId: string, subscribed = false) {
  if (subscribed) {
    window.open(import.meta.env.VITE_APP_STRIPE_CUSTOMER_PORTAL, '_self')
  }
  else {
    const { url } = await subscriptionStore.createSubscriptionCheckoutUrl(subscriptionStore.customer!.id, priceId)

    window.open(url, '_self')
  }
}
</script>

<template>
  <!-- 👉 Title and subtitle -->
  <div class="text-center mb-6">
    <slot name="heading">
      <h4 class="text-h4 mb-2">
        {{ props.title ? props.title : 'Pricing Plans' }}
      </h4>
    </slot>
    <slot name="subtitle">
      <p class="mb-0">
        Choose the plan that fits your needs
      </p>
    </slot>
  </div>
  <!-- SECTION pricing plans -->
  <VRow>
    <VCol
      v-for="plan in pricingComputed"
      :key="plan.id"
      v-bind="props"
    >
      <!-- 👉  Card -->
      <VCard
        flat
        border
        :class="plan.unit_amount === 200 ? 'border-primary border-opacity-100' : ''"
      >
        <VCardText
          class="text-end pt-4"
          style="block-size: 3.75rem;"
        >
          <!-- 👉 Popular -->
          <VChip
            v-show="plan.unit_amount === 200"
            color="primary"
            size="small"
          >
            Popular
          </VChip>
        </VCardText>

        <VCardText class="position-relative text-center">
          <div>
            <div class="d-flex justify-center align-center">
              <span class="text-body-1 font-weight-medium align-self-start">$</span>
              <h1 class="text-h3 font-weight-medium text-primary">
                {{ new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: (plan.currency || 'usd').toUpperCase(),
                }).format(plan.unit_amount || 0) }}
              </h1>
              <span class="text-body-1 font-weight-medium align-self-end">/month</span>
            </div>
          </div>
        </VCardText>
        <!-- 👉 Plan features -->
        <VCardText class="pt-2">
          <VList class="card-list pb-5">
            <VListItem
              v-for="feature in stripeStore.stripeProducts[0]?.marketing_features"
              :key="feature"
            >
              <template #prepend />

              <VListItemTitle class="text-body-1 d-flex align-center">
                <VIcon
                  :size="14"
                  icon="ri-circle-line"
                  class="me-2"
                />
                <div class="text-truncate">
                  {{ feature.name }}
                </div>
              </VListItemTitle>
            </VListItem>
          </VList>

          <!-- 👉 Plan actions -->
          <VBtn
            :active="false"
            block
            :color="plan.current ? 'success' : 'primary'"
            :variant="plan.unit_amount === 200 ? 'elevated' : 'outlined'"
            @click="handleSubscribe(plan.id, plan.current)"
          >
            {{ plan.current ? 'Your Current Plan' : 'Upgrade' }}
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
  <!-- !SECTION  -->
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 1rem;
}

.pricing-save-chip {
  display: flex;
  inset-block-start: -2.125rem;
  inset-inline-end: -6.5rem;
}
</style>
