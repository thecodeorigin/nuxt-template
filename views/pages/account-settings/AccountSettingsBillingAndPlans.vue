<script lang="ts" setup>
const isPricingPlanDialogVisible = ref(false)

const stripeStore = useStripeStore()
const subscriptionStore = useSubscriptionStore()

useLazyAsyncData(() => subscriptionStore.fetchSubscriptions())

const subscriptions = computed(() => subscriptionStore.subscriptions)

useLazyAsyncData(() => stripeStore.fetchStripeProductPrices())
</script>

<template>
  <VRow>
    <!-- 👉 Current Plan -->
    <VCol v-for="subscription in subscriptions" :key="subscription.id" cols="12">
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
                  <div class="d-flex align-center gap-x-2">
                    <h6 class="text-h6">
                      {{ new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: (subscription.currency || 'usd').toUpperCase(),
                      }).format(subscription.plan?.amount || 0) }} Per Month
                    </h6>
                  </div>
                </div>
              </div>
            </VCol>

            <VCol
              v-if="subscription.plan?.amount !== 0"
              cols="12"
              md="6"
            >
              <VAlert
                v-if="subscription.days_until_due && subscription.days_until_due <= 5"
                type="warning"
                variant="tonal"
                title="We need your attention!"
                text="Your plan requires updates"
              />

              <!-- progress -->
              <h6 class="d-flex text-h6 justify-space-between mt-6 mb-1">
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
              <p class="text-base mt-1">
                {{ subscription.days_until_due }} days remaining until your plan requires update
              </p>
            </VCol>

            <VCol cols="12">
              <div class="d-flex flex-wrap gap-4">
                <VBtn @click="isPricingPlanDialogVisible = true">
                  upgrade plan
                </VBtn>

                <VBtn
                  color="error"
                  variant="outlined"
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
