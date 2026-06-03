<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Invoice, OrganizationBillingSettings } from '@nuxthub/db/schema'
import { useBillingApi } from '#layers/billing/app/api/useBillingApi'

definePageMeta({ can: ['billing:read', 'billing:manage'] })
useHead({ title: 'Invoice' })

const api = useBillingApi()
const toast = useToast()

const { data: settings, error: settingsError } = useAsyncData<OrganizationBillingSettings>(
  'billing-settings',
  () => api.fetchBillingSettings(),
  { default: (): OrganizationBillingSettings => ({ organization_id: '', currency: 'USD' }) },
)
whenError(settingsError)

const { data: invoices, error: invoicesError } = useAsyncData<Invoice[]>(
  'invoices',
  () => api.fetchInvoices(),
  { default: (): Invoice[] => [] },
)
whenError(invoicesError)

const settingsForm = reactive({
  company_name: '',
  tax_id: '',
  address: '',
  city: '',
  country: 'US',
  currency: 'USD',
})

watch(settings, (s) => {
  if (!s)
    return
  settingsForm.company_name = s.company_name ?? ''
  settingsForm.tax_id = s.tax_id ?? ''
  settingsForm.address = s.address ?? ''
  settingsForm.city = s.city ?? ''
  settingsForm.country = s.country ?? 'US'
  settingsForm.currency = s.currency ?? 'USD'
}, { immediate: true })

const savingSettings = ref(false)

async function saveSettings() {
  savingSettings.value = true
  try {
    await api.updateBillingSettings({
      company_name: settingsForm.company_name || undefined,
      tax_id: settingsForm.tax_id || undefined,
      address: settingsForm.address || undefined,
      city: settingsForm.city || undefined,
      country: settingsForm.country || undefined,
      currency: settingsForm.currency || undefined,
    })
    toast.add({ title: 'Settings saved', color: 'success' })
  }
  catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    toast.add({ title: 'Error', description: e?.data?.statusMessage ?? 'Unknown error', color: 'error' })
  }
  finally {
    savingSettings.value = false
  }
}

const invoiceColumns: TableColumn<Invoice>[] = [
  { accessorKey: 'number', header: 'Number' },
  { accessorKey: 'status', header: 'Status' },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => new Intl.NumberFormat('en-US', { style: 'currency', currency: row.original.currency }).format(row.original.total / 100),
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
    <UPageCard title="Invoice Information" description="Company details that appear on invoices." variant="subtle">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <UFormField label="Company name">
          <UInput v-model="settingsForm.company_name" placeholder="Acme Inc." class="w-full" />
        </UFormField>
        <UFormField label="Tax ID">
          <UInput v-model="settingsForm.tax_id" placeholder="123-456-789" class="w-full" />
        </UFormField>
        <UFormField label="Address" class="sm:col-span-2">
          <UInput v-model="settingsForm.address" placeholder="123 Main St" class="w-full" />
        </UFormField>
        <UFormField label="City">
          <UInput v-model="settingsForm.city" placeholder="San Francisco" class="w-full" />
        </UFormField>
        <UFormField label="Country">
          <UInput v-model="settingsForm.country" placeholder="US" class="w-full" maxlength="2" />
        </UFormField>
        <UFormField label="Default Currency">
          <UInput v-model="settingsForm.currency" placeholder="USD" class="w-full" maxlength="3" />
        </UFormField>
      </div>
      <div class="mt-4 flex justify-end">
        <UButton label="Save" :loading="savingSettings" @click="saveSettings()" />
      </div>
    </UPageCard>

    <div>
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold">
          Invoices
        </h3>
      </div>
      <UTable :data="invoices" :columns="invoiceColumns" />
      <p v-if="invoices.length === 0" class="text-sm text-muted text-center py-6">
        No invoices yet.
      </p>
    </div>
  </div>
</template>
