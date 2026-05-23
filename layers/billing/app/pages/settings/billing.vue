<script setup lang="ts">
import { useBillingApi } from '#layers/billing/app/api/useBillingApi'
import BillingModal from '#layers/billing/app/components/Billing/BillingModal.vue'

definePageMeta({ can: ['billing:read'] })
useHead({ title: 'Billing' })

const billingApi = useBillingApi()
const { data, refresh, error } = useAsyncData('billing-balance', () => billingApi.fetchBalance(), { default: () => ({ balance: 0 }) })
whenError(error)

const modalOpen = ref(false)
</script>

<template>
  <div>
    <UPageCard title="Billing" description="Organization credit balance and top-up." variant="naked" orientation="horizontal" class="mb-4">
      <UButton label="Top up" icon="i-lucide-plus" class="w-fit lg:ms-auto" @click="modalOpen = true" />
    </UPageCard>
    <UPageCard variant="subtle">
      <UFormField label="Credit balance" class="flex justify-between items-center gap-4">
        <UBadge :label="`${data.balance.toLocaleString('vi-VN')} ₫`" color="success" variant="subtle" size="lg" />
      </UFormField>
    </UPageCard>
    <BillingModal v-model:open="modalOpen" @success="refresh()" />
  </div>
</template>
