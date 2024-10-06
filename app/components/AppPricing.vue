<script setup lang="ts">
import type { StripePricingMetadata } from '@base/utils/types/stripe'

const props = defineProps<Pricing>()

const { t } = useI18n()

const stripeStore = useStripeStore()
const subscriptionStore = useSubscriptionStore()

// subscriptionStore.fetchSubscriptions()
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
    const isCurrentPlan = subscriptionStore.subscriptions.some(sub => sub.items.data[0]?.plan.id === price.id)
    return {
      ...price,
      current: isCurrentPlan,
      features: (price.metadata as any as StripePricingMetadata)?.marketing_features ? JSON.parse(price.metadata?.marketing_features.replace(/'/g, '"')) : [], // set metadata in stripe pricing like marketing_features: "['feature1', 'feature2']"
    }
  })
  return newArrayOfPrices
})

async function handleSubscribe(priceId: string, subscribed = false) {
  if (subscribed) {
    window.open(import.meta.env.STRIPE_CUSTOMER_PORTAL_URL, '_self')
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
        {{ props.title ? props.title : t('Pricing Plans') }}
      </h4>
    </slot>
    <slot name="subtitle">
      <p class="mb-0">
        {{ t('Choose the plan that fits your needs') }}
      </p>
    </slot>
  </div>
  <!-- SECTION pricing plans -->

  <VRow v-if="pricingComputed && pricingComputed?.length > 0" data-test="pricing-list" class="justify-center">
    <VCol
      v-for="plan in pricingComputed?.reverse()"
      :key="plan.id"
      v-bind="props"
    >
      <!-- 👉  Card -->
      <VCard
        flat
        border
      >
        <VCardText class="position-relative text-center">
          <div>
            <div class="d-flex align-center">
              <h1 data-test="pricing-price" class="text-h3 text-primary font-weight-bold">
                {{ new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: (plan.currency || 'usd').toUpperCase(),
                }).format((plan.unit_amount || 0) / 100) }}
              </h1>
              <span class="text-body-1 font-weight-medium align-self-end">/{{ t('month') }}</span>
            </div>
          </div>

          <!-- 👉 Plan actions -->
          <VBtn
            :active="false"
            block
            :disabled="plan.current"
            color="primary"
            class="mt-4"
            :data-test="plan.current ? 'current-plan-button' : 'upgrade-plan-button'"
            @click="handleSubscribe(plan.id, plan.current)"
          >
            {{ plan.current ? t('Your Current Plan') : t('Upgrade') }}
          </VBtn>
        </VCardText>
        <!-- 👉 Plan features -->
        <VCardText class="pt-2">
          <VList class="card-list pb-5">
            <!-- title package includes color black -->
            <VListItemTitle class="mb-3 font-weight-medium">
              {{ t('Package Includes') }}
            </VListItemTitle>
            <VListItem
              v-for="feature in plan.features"
              :key="feature"
            >
              <template #prepend />

              <VListItemTitle class="text-body-1 d-flex align-center">
                <VIcon
                  :size="14"
                  icon="mdi-check"
                  class="me-2 icon-check"
                />
                <div data-test="pricing-features" class="text-truncate">
                  {{ feature }}
                </div>
              </VListItemTitle>
            </VListItem>
          </VList>
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

.icon-check {
  fill: #10b981;
}
</style>
