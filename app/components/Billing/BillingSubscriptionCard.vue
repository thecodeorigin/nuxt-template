<script setup lang="ts">
const { t } = useI18n()

useHead({
  title: t('Subscription Information'),
})

const subscriptionStore = useSubscriptionStore()

const config = useRuntimeConfig()

const customerPortalUrl = config.public.stripe.customerPortalURL

useLazyAsyncData('subscription', () => subscriptionStore.fetchSubscriptions(), {
  immediate: Boolean(customerPortalUrl),
})

const subscription = computed(() => subscriptionStore.currentSubscription)

const dateExpired = computed(() => {
  if (!subscription.value)
    return ''

  return new Date(subscription.value.current_period_end * 1000).toLocaleDateString()
})

async function handleOpenStripePortal() {
  try {
    if (customerPortalUrl)
      window.open(customerPortalUrl, '_blank')
    else
      notifyWarning({ content: t('Stripe customer self-service portal is not currently available!') })
  }
  catch {}
}

const billingCycleProgress = computed(() => {
  if (!subscription.value)
    return 0

  return Math.round(
    (
      subscription.value.current_period_end
      - subscription.value.current_period_start
    )
    / (
      subscription.value.current_period_end
      - subscription.value.current_period_start
    )
    * 100,
  )
})
</script>

<template>
  <UCard>
    <template v-if="subscription">
      <p>
        {{ $t('Your plan') }}
        <strong class="text-primary">
          "{{ subscription.items.data[0]?.price.metadata?.name || $t('Unsubscribed') }}"
        </strong>
        <span>{{ $t('is active until {0}', [dateExpired]) }}</span>
      </p>

      <div class="mt-2">
        <strong>
          {{ new Intl.NumberFormat('en-US', { style: 'currency', currency: (subscription?.currency || 'USD').toUpperCase() }).format((subscription?.items.data[0]?.price.unit_amount || 0) / 100) }} {{ $t('Per Month') }}
        </strong>

        <UBadge v-if="subscription?.metadata.hightlight" :label="$t('Popular')" />
      </div>

      <UButton class="mt-2 py-1 text-xs" color="neutral" variant="solid" @click="handleOpenStripePortal">
        {{ $t('Upgrade or manage subscription') }}
      </UButton>

      <div class="mt-4">
        <!-- billing cycle -->
        <div class="flex justify-between">
          <p>
            {{ $t('Billing cycle') }}
          </p>
          <p>
            {{ subscription?.days_until_due || 0 }}
            {{ $t('days remaining') }}
          </p>
        </div>
        <UProgress class="mt-2 h-1" size="md" :value="billingCycleProgress" />
      </div>
    </template>
    <template v-else-if="customerPortalUrl">
      <p>
        {{ $t('You are not subscribed to any monthly plan') }}
      </p>
      <div class="mt-4">
        <UButton color="neutral" variant="solid" to="/pricing">
          {{ $t('View Subscriptions') }}
        </UButton>
      </div>
    </template>
    <p v-else class="text-gray-500 cursor-not-allowed">
      {{ $t('Monthly subscription plan is not available at the moment') }}
    </p>
  </UCard>
</template>
