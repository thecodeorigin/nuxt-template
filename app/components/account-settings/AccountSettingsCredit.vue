<script lang="ts" setup>
const { t } = useI18n()

const isPricingPlanDialogVisible = ref(false)

const stripeStore = useStripeStore()
const subscriptionStore = useSubscriptionStore()

useLazyAsyncData(() => subscriptionStore.fetchSubscriptions())

const subscription = computed(() => subscriptionStore.currentSubscription)

const dateExpired = computed(() => {
  if (!subscription.value)
    return ''
  return new Date(subscription.value.current_period_end * 1000).toLocaleDateString()
})
useLazyAsyncData(() => stripeStore.fetchStripeProductPrices())

async function handleOpenStripePortal() {
  try {
    await confirmation({
      title: t('Heads Up!'),
      body: t('You will be redirected to the Stripe portal to manage your subscription!'),
    })

    useTrackEvent('subscription:portal')

    if (import.meta.env.STRIPE_CUSTOMER_PORTAL_URL)
      window.location.href = import.meta.env.STRIPE_CUSTOMER_PORTAL_URL
    else
      notifyWarning({ content: t('Stripe customer self-service portal is not currently available!') })
  }
  catch {}
}

// computed check is 50% of the way to the end of the billing cycle
const isSubscriptionDue = computed(() => {
  if (!subscription.value)
    return false
  return subscription.value.days_until_due && subscription.value.days_until_due <= 15
})
</script>

<template>
  <VRow>
    <!-- 👉 Current Plan -->
    <VCol v-if="subscription" data-test="current-plan-component" cols="12">
      <VCard>
        <VCardItem class="pb-6">
          <VCardTitle>{{ $t('Current Plan') }}</VCardTitle>
        </VCardItem>
        <VCardText>
          <VRow>
            <VCol
              cols="12"
              md="6"
            >
              <div class="d-flex flex-column gap-y-6">
                <div class="d-flex flex-column gap-y-1">
                  <h6 class="text-h6">
                    {{ $t('Your Current Plan is') }}
                    <span data-test="plan-name">{{ subscription.items.data[0]?.price.metadata?.name }}</span>
                  </h6>
                  <div>
                    {{ $t('A simple start for everyone') }}
                  </div>
                </div>

                <div class="d-flex flex-column gap-y-1">
                  <h6 class="text-h6">
                    {{ $t('Active until') }}
                    <span data-test="plan-expired-date">
                      {{ dateExpired }}
                    </span>
                  </h6>
                  <div>
                    {{ $t('We will send you a notification upon Subscription expiration') }}
                  </div>
                </div>

                <div class="d-flex flex-column gap-y-1">
                  <div class="d-flex align-center gap-x-2">
                    <h6 class="text-h6">
                      <span data-test="plan-price">
                        {{ new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: (subscription.currency || 'usd').toUpperCase(),
                        }).format((subscription.items.data[0]?.price.unit_amount || 0) / 100) }}
                      </span> {{ $t('Per Month') }}
                    </h6>
                    <VChip
                      color="primary"
                      size="small"
                    >
                      {{ $t('Popular') }}
                    </VChip>
                  </div>
                  <p class="text-base mb-0">
                    {{ $t('Standard plan for small to medium businesses') }}
                  </p>
                </div>
              </div>
            </VCol>
            <VCol
              v-if="subscription.items.data[0]?.price.unit_amount !== 0"
              cols="12"
              md="6"
            >
              <VAlert
                v-if="subscription.days_until_due && subscription.days_until_due <= 15"
                type="warning"
                variant="tonal"
                title="We need your attention!"
                text="Your plan requires updates"
              />

              <!-- progress -->
              <h6 class="d-flex text-h6 justify-space-between mb-1">
                <div>{{ $t('days') }}</div>
                <div v-if="subscription.days_until_due">
                  {{ 30 - subscription.days_until_due }} {{ $t('of') }} 30 {{ $t('days') }}
                </div>
              </h6>
              <VProgressLinear
                color="primary"
                rounded
                height="6"
                :model-value="subscription.days_until_due ? 30 - subscription.days_until_due : 0"
              />
              <div v-if="!isSubscriptionDue" class="text-base mt-1 d-flex align-center">
                <VIcon
                  :size="14"
                  icon="mdi-check"
                  class="me-2 icon-check"
                />
                <p>{{ $t('Your plan is active, no further action required') }}</p>
              </div>

              <div v-else class="text-base mt-1 d-flex align-center">
                <VIcon
                  :size="14"
                  icon="mdi-alert"
                  class="me-2"
                />
                <p>{{ $t('Your plan is due for renewal in 15 days') }}</p>
              </div>
            </VCol>

            <VCol cols="12">
              <div class="d-flex flex-wrap gap-4">
                <VBtn @click="isPricingPlanDialogVisible = true">
                  {{ $t('Upgrade Plan') }}
                </VBtn>

                <VBtn
                  variant="outlined"
                  @click="handleOpenStripePortal"
                >
                  {{ $t('Manage Subscription') }}
                </VBtn>
              </div>
            </VCol>
          </VRow>

          <!-- 👉 plan and pricing dialog -->
          <PricingPlanDialog v-model="isPricingPlanDialogVisible" />
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style scoped>
.icon-check {
  fill: #10b981;
}
</style>
