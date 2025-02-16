<script setup lang="ts">
import { groupBy } from 'lodash-es'
import type Stripe from 'stripe'
import type { StripePricingMetadata } from '~/utils/types/stripe'

interface Props {
  title: string
  description: string
  stripePrices: Stripe.Price[]
}

const props = defineProps<Props>()
const subscriptionStore = useSubscriptionStore()
const runtimeConfig = useRuntimeConfig()

const pricingComputed = computed(() => {
  if (!props.stripePrices)
    return []

  const newArrayOfPrices = Object.values(props.stripePrices)?.map((price) => {
    const isCurrentPlan = subscriptionStore.subscriptions.some(sub => sub.items.data[0]?.plan.id === price.id)
    return {
      ...price,
      current: isCurrentPlan,
      features: (price.metadata as any as StripePricingMetadata)?.marketing_features ? JSON.parse(price.metadata?.marketing_features!.replace(/'/g, '"')) : [], // set metadata in stripe pricing like marketing_features: "['feature1', 'feature2']"
    }
  }).sort((a, b) => (a.unit_amount ?? 0) - (b.unit_amount ?? 0))
  return groupBy(newArrayOfPrices, 'recurring.interval')
})

const isYearly = ref(false)

const pricingByInterval = computed(() => {
  return isYearly.value ? pricingComputed.value.year : pricingComputed.value.month
})

async function handleSubscribe(priceId: string, subscribed = false) {
  if (subscribed) {
    window.open(runtimeConfig.public.stripe.customerPortalURL, '_self')
  }
  else {
    const { url } = await subscriptionStore.createSubscriptionCheckoutUrl(subscriptionStore.customer!.id, priceId)

    window.open(url, '_self')
  }
}
</script>

<template>
  <div>
    <UPageHero v-bind="props" align="center">
      <template #links>
        <UPricingToggle
          v-model="isYearly"
          class="w-48 mx-auto"
        />
      </template>
    </UPageHero>

    <UContainer>
      <UPricingGrid>
        <template
          v-for="(plan, index) in pricingByInterval"
          :key="index"
        >
          <UPricingCard
            v-if="plan.unit_amount !== null"
            v-bind="plan"
            :title="plan.metadata.name"
            :highlight="Boolean(plan.metadata.highlight)"
            :badge="Boolean(plan.metadata.highlight) ? { label: 'Most popular' } : undefined"
            :description="plan.metadata.description"
            :price="isYearly ? `${plan.unit_amount * 12} ${plan.currency}` : `${plan.unit_amount} ${plan.currency}`"
            :cycle="isYearly ? '/year' : '/month'"
            :button="{
              label: plan.current ? 'Current Plan' : 'Subscribe',
              disabled: plan.current,
              variant: plan.current ? 'soft' : 'solid',
              click: () => handleSubscribe(plan.id, plan.current) }"
          />
        </template>
      </UPricingGrid>
    </UContainer>
  </div>
</template>
