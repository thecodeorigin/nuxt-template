<script setup lang="ts">
const subscriptionStore = useSubscriptionStore()
useLazyAsyncData(() => subscriptionStore.fetchSubscriptions())
const runtimeConfig = useRuntimeConfig()

const subscription = computed(() => subscriptionStore.currentSubscription)

const dateExpired = computed(() => {
  if (!subscription.value)
    return ''
  return new Date(subscription.value.current_period_end * 1000).toLocaleDateString()
})

async function handleOpenStripePortal() {
  try {
  //   await confirmation({
  //     title: 'Heads Up!',
  //     body: 'You will be redirected to the Stripe portal to manage your subscription!',
  //   })

    //   useTrackEvent('subscription:portal')
    const customerPortalUrl = runtimeConfig.public.stripe.customerPortalURL
    if (customerPortalUrl)
      window.open(customerPortalUrl, '_blank')
    else
      notifyWarning({ content: 'Stripe customer self-service portal is not currently available!' })
  }
  catch {}
}

const billingCycleProgress = computed(() => {
  if (!subscription.value)
    return 0
  return Math.round((subscription.value.current_period_end - subscription.value.current_period_start) / (subscription.value.current_period_end - subscription.value.current_period_start) * 100)
})
</script>

<template>
  <UDashboardPanelContent class="pb-24 pt-10">
    <!--  -->
    <div class="grid gap-5 grid-cols-1 lg:grid-cols-3">
      <div>
        <p class="font-semibold">
          Subscription plan
        </p>
        <p class="text-sm text-gray-500 mt-2">
          Manage your subscription plan and billing cycle
        </p>
        <UButton class="mt-2 py-1 text-xs" color="white" variant="solid">
          Pricing
          <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-4 h-4" />
        </UButton>
      </div>
      <div class="col-span-2">
        <p>
          Your current plan is <strong v-if="subscription" class="text-primary">
            {{ subscription.items.data[0]?.price.metadata?.name }}
          </strong>
        </p>
        <UButton class="mt-2 py-1 text-xs" color="white" variant="solid" @click="handleOpenStripePortal">
          Manage subscription plan
        </UButton>
        <UCard class="mt-4">
          <div>
            <strong>
              Active until {{ dateExpired }}
            </strong>
            <p>
              We will send you a notification upon Subscription expiration
            </p>
          </div>
          <div class="mt-2">
            <strong v-if="subscription">
              {{ new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: (subscription.currency || 'usd').toUpperCase(),
              }).format((subscription.items.data[0]?.price.unit_amount || 0) / 100) }} Per Month
            </strong>

            <UBadge label="Popular" />
            <p>
              Standard plan for small to medium businesses
            </p>
          </div>
          <UButton class="mt-2 py-1 text-xs" color="white" variant="solid">
            Upgrade plan
          </UButton>
        </UCard>
        <div class="mt-8">
          <!-- billing cycle -->
          <div class="flex justify-between">
            <p>
              Billing cycle
            </p>
            <p>
              {{ subscription?.days_until_due || 0 }}
              days remaining
            </p>
          </div>
          <UProgress class="mt-2 h-1" size="md" :indicator="false" :value="billingCycleProgress" />
        </div>
      </div>
    </div>
  </UDashboardPanelContent>
</template>
