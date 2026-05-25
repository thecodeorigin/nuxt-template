<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { ReferralEntry } from '#layers/referral/app/api/useReferralApi'
import { h, resolveComponent } from 'vue'
import { useReferralApi } from '#layers/referral/app/api/useReferralApi'
import ReferralCard from '#layers/referral/app/components/Referral/ReferralCard.vue'
import DashboardNavbar from '~/components/Dashboard/DashboardNavbar.vue'

useHead({ title: 'Referral' })

const referralApi = useReferralApi()
const { data, error } = useAsyncData('referral-stats', () => referralApi.fetchReferralStats(), {
  default: () => ({ code: '', referredCount: 0, totalEarned: 0, referrals: [] as ReferralEntry[] }),
})
whenError(error)

const q = ref('')
const page = ref(1)
const pageSize = 10

const filteredReferrals = computed(() => {
  const term = q.value.trim().toLowerCase()
  if (!term)
    return data.value.referrals
  return data.value.referrals.filter(r => r.email.toLowerCase().includes(term))
})

const paginatedReferrals = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredReferrals.value.slice(start, start + pageSize)
})

watch(q, () => {
  page.value = 1
})

const columns: TableColumn<ReferralEntry>[] = [
  { accessorKey: 'email', header: 'Email' },
  {
    accessorKey: 'source',
    header: 'Source',
    cell: ({ row }) => {
      const UBadge = resolveComponent('UBadge')
      return h(UBadge, { label: row.original.source === 'invite' ? 'Invite' : 'Link', color: 'neutral', variant: 'subtle' })
    },
  },
  {
    accessorKey: 'reward_paid',
    header: 'Status',
    cell: ({ row }) => {
      const UBadge = resolveComponent('UBadge')
      return h(UBadge, {
        label: row.original.reward_paid ? 'Rewarded' : 'Pending',
        color: row.original.reward_paid ? 'success' : 'warning',
        variant: 'subtle',
      })
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Date',
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
]
</script>

<template>
  <UDashboardPanel id="referral">
    <template #header>
      <DashboardNavbar title="Referral" />
    </template>

    <template #body>
      <div class="p-6 space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UPageCard
            title="Your referral link"
            description="Share this link to invite others. You'll earn credits when they top up for the first time."
            variant="subtle"
          >
            <ReferralCard v-if="data.code" :code="data.code" />
          </UPageCard>

          <div class="flex flex-col gap-4">
            <UCard class="flex-1">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-muted">
                  Total Referred
                </p>
                <p class="text-3xl font-bold tabular-nums">
                  {{ data.referredCount }}
                </p>
              </div>
            </UCard>
            <UCard class="flex-1">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-muted">
                  Total Earned
                </p>
                <p class="text-3xl font-bold tabular-nums">
                  {{ data.totalEarned.toLocaleString() }}
                </p>
              </div>
            </UCard>
          </div>
        </div>

        <UCard :ui="{ body: 'sm:p-0', footer: 'p-0' }">
          <template #header>
            <div class="flex items-center justify-between">
              <p class="font-semibold">
                Referrals
              </p>
              <UInput
                v-model="q"
                icon="i-lucide-search"
                placeholder="Filter by email…"
                size="sm"
                class="w-56"
              />
            </div>
          </template>

          <UTable :data="paginatedReferrals" :columns="columns">
            <template #empty>
              <div class="py-8 text-center text-sm text-muted">
                No referrals yet.
              </div>
            </template>
          </UTable>

          <template #footer>
            <UPagination
              v-if="filteredReferrals.length > pageSize"
              v-model:page="page" :total="filteredReferrals.length" :items-per-page="pageSize"
            />
          </template>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
