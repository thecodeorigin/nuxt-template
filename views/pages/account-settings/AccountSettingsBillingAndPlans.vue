<script lang="ts" setup>
const isPricingPlanDialogVisible = ref(false)

const stripeStore = useStripeStore()

useLazyAsyncData(() => stripeStore.fetchStripeProductPrices())
</script>

<template>
  <VRow>
    <!-- 👉 Current Plan -->
    <VCol cols="12">
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
                    Your Current Plan is Basic
                  </h6>
                  <div>
                    A simple start for everyone
                  </div>
                </div>

                <div class="d-flex flex-column gap-y-1">
                  <h6 class="text-h6">
                    Active until Dec 09, 2021
                  </h6>
                  <div>
                    We will send you a notification upon Subscription expiration
                  </div>
                </div>

                <div class="d-flex flex-column gap-y-1">
                  <div class="d-flex align-center gap-x-2">
                    <h6 class="text-h6">
                      $199 Per Month
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
              cols="12"
              md="6"
            >
              <VAlert
                type="warning"
                variant="tonal"
                title="We need your attention!"
                text="Your plan requires updates"
              />

              <!-- progress -->
              <h6 class="d-flex text-h6 justify-space-between mt-6 mb-1">
                <div>Days</div>
                <div>12 of 30 Days</div>
              </h6>
              <VProgressLinear
                color="primary"
                rounded
                height="6"
                model-value="18"
              />
              <p class="text-base mt-1">
                18 days remaining until your plan requires update
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
