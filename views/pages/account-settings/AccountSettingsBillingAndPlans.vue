<script lang="ts" setup>
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

function handleOpenStripePortal() {
  window.open(import.meta.env.STRIPE_CUSTOMER_PORTAL_URL, '_self')
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
    <VCol v-if="subscription" cols="12">
      <VCard>
        <VCardItem class="pb-6">
          <VCardTitle>Current Plan</VCardTitle>
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
                    Your Current Plan is {{ subscription.items.data[0].price.metadata?.name }}
                  </h6>
                  <div>
                    A simple start for everyone
                  </div>
                </div>

                <div class="d-flex flex-column gap-y-1">
                  <h6 class="text-h6">
                    Active until {{ dateExpired }}
                  </h6>
                  <div>
                    We will send you a notification upon Subscription expiration
                  </div>
                </div>

                <div class="d-flex flex-column gap-y-1">
                  <div class="d-flex align-center gap-x-2">
                    <h6 class="text-h6">
                      {{ new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: (subscription.currency || 'usd').toUpperCase(),
                      }).format((subscription.items.data[0].price.unit_amount || 0) / 100) }} Per Month
                    </h6>
                    <VChip
                      color="primary"
                      size="small"
                    >
                      Popular
                    </VChip>
                  </div>
                  <p class="text-base mb-0">
                    Standard plan for small to medium businesses
                  </p>
                </div>
              </div>
            </VCol>
            <VCol
              v-if="subscription.items.data[0].price.unit_amount !== 0"
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
                <div>Days</div>
                <div v-if="subscription.days_until_due">
                  {{ 30 - subscription.days_until_due }} of 30 Days
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
                <p>Your plan is active, no further action required</p>
              </div>

              <div v-else class="text-base mt-1 d-flex align-center">
                <VIcon
                  :size="14"
                  icon="mdi-alert"
                  class="me-2"
                />
                <p>Your plan is due for renewal in 15 days</p>
              </div>
            </VCol>

            <VCol cols="12">
              <div class="d-flex flex-wrap gap-4">
                <VBtn @click="isPricingPlanDialogVisible = true">
                  upgrade plan
                </VBtn>

                <VBtn
                  color="error"
                  variant="outlined"
                  @click="handleOpenStripePortal"
                >
                  Cancel Subscription
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
