<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useBillingApi } from '#layers/billing/app/api/useBillingApi'
import BillingModal from '#layers/billing/app/components/Billing/BillingModal.vue'

definePageMeta({ can: ['billing:read'] })
useHead({ title: 'Billing' })

const billingApi = useBillingApi()
const { data, refresh, error } = useAsyncData('billing-balance', () => billingApi.fetchBalance(), { default: () => ({ balance: 0 }) })
whenError(error)

const page = ref(1)
const { data: txData, error: txError } = useAsyncData(
  () => `billing-transactions-${page.value}`,
  () => billingApi.fetchTransactions(page.value),
  { default: () => ({ items: [], page: 1, limit: 20 }), watch: [page] },
)
whenError(txError)

const modalOpen = ref(false)

interface TxRow { id: string, type: string, status: string, amount: number, created_at: string }

const columns: TableColumn<TxRow>[] = [
  { accessorKey: 'type', header: 'Type' },
  { accessorKey: 'status', header: 'Status' },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.original.amount),
  },
  {
    accessorKey: 'created_at',
    header: 'Date',
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
]
</script>

<template>
  <div class="space-y-6">
    <UPageCard title="Billing" description="Organization credit balance and top-up." variant="naked" orientation="horizontal">
      <UButton label="Top up" icon="i-lucide-plus" class="w-fit lg:ms-auto" @click="modalOpen = true" />
    </UPageCard>

    <UPageCard variant="subtle">
      <UFormField label="Credit balance" class="flex justify-between items-center gap-4">
        <UBadge :label="`${data.balance.toLocaleString('vi-VN')} ₫`" color="success" variant="subtle" size="lg" />
      </UFormField>
    </UPageCard>

    <div>
      <h3 class="text-sm font-semibold mb-3 text-muted">
        Transactions
      </h3>
      <UTable :data="(txData?.items ?? []) as TxRow[]" :columns="columns" />
      <div v-if="(txData?.items?.length ?? 0) === txData?.limit" class="mt-3 flex justify-end">
        <UPagination v-model:page="page" :total="page * txData!.limit + 1" :page-count="txData!.limit" />
      </div>
    </div>

    <BillingModal v-model:open="modalOpen" @success="refresh()" />
  </div>
</template>
