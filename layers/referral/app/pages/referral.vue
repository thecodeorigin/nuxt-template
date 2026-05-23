<script setup lang="ts">
import { useReferralApi } from '#layers/referral/app/api/useReferralApi'
import ReferralCard from '#layers/referral/app/components/Referral/ReferralCard.vue'

const referralApi = useReferralApi()
const { data, error } = useAsyncData('referral-stats', () => referralApi.fetchReferralStats(), {
  default: () => ({ code: '', referredCount: 0 }),
})
whenError(error)
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Referral" />
    </template>
    <div class="p-4 max-w-lg mx-auto space-y-6">
      <UPageCard
        title="Your referral link"
        description="Share this link to invite others. You'll earn credits when they top up for the first time."
        variant="subtle"
      >
        <ReferralCard v-if="data.code" :code="data.code" />
      </UPageCard>
      <UPageCard variant="subtle">
        <UFormField label="People referred" class="flex justify-between items-center gap-4">
          <UBadge :label="`${data.referredCount}`" color="neutral" variant="subtle" size="lg" />
        </UFormField>
      </UPageCard>
    </div>
  </UDashboardPanel>
</template>
