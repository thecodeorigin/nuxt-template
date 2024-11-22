<script setup lang="ts">
import type { Invoice } from '@db/apps/invoice/types'

const searchQuery = ref('')
const selectedStatus = ref()

// Data table options
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()

// Update data table options
function updateOptions(options: any) {
  page.value = options.page
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

const isLoading = ref(false)

// 👉 headers
const headers = [
  { title: '#', key: 'id' },
  { title: 'Trending', key: 'trending', sortable: false },
  { title: 'Total', key: 'total' },
  { title: 'Issued Date', key: 'date', width: '150px' },
  { title: 'Actions', key: 'actions', sortable: false, width: '150px' },
]

// 👉 Fetch Invoices
const { data: invoiceData, execute: fetchInvoices } = await useApi<any>(createUrl('/apps/invoice', {
  query: {
    q: searchQuery,
    status: selectedStatus,
    itemsPerPage,
    page,
    sortBy,
    orderBy,
  },
}))

const invoices = computed((): Invoice[] => invoiceData.value?.invoices)
const totalInvoices = computed(() => invoiceData.value?.totalInvoices)

// 👉 Invoice balance variant resolver
function resolveInvoiceBalanceVariant(balance: string | number, total: number) {
  if (balance === total)
    return { status: 'Unpaid', chip: { color: 'error' } }

  if (balance === 0)
    return { status: 'Paid', chip: { color: 'success' } }

  return { status: balance, chip: { variant: 'text' } }
}

// 👉 Invoice status variant resolver
function resolveInvoiceStatusVariantAndIcon(status: string) {
  if (status === 'Partial Payment')
    return { variant: 'warning', icon: 'ri-line-chart-line' }
  if (status === 'Paid')
    return { variant: 'success', icon: 'ri-check-line' }
  if (status === 'Downloaded')
    return { variant: 'info', icon: 'ri-arrow-down-line' }
  if (status === 'Draft')
    return { variant: 'secondary', icon: 'ri-save-line' }
  if (status === 'Sent')
    return { variant: 'primary', icon: 'ri-mail-line' }
  if (status === 'Past Due')
    return { variant: 'error', icon: 'ri-error-warning-line' }

  return { variant: 'secondary', icon: 'ri-close-line' }
}

const computedMoreList = computed(() => {
  return (paramId: number) => ([
    { title: 'Download', value: 'download', prependIcon: 'ri-download-line' },
    {
      title: 'Edit',
      value: 'edit',
      prependIcon: 'ri-pencil-line',
      to: { name: 'apps-invoice-edit-id', params: { id: paramId } },
    },
    { title: 'Duplicate', value: 'duplicate', prependIcon: 'ri-stack-line' },
  ])
})

// 👉 Delete Invoice
// 👉 Delete Invoice
async function deleteInvoice(id: number) {
  await $api(`/apps/invoice/${id}`, { method: 'DELETE' })

  fetchInvoices()
}
</script>

<template>
  <section v-if="invoices">
    <VCard
      id="invoice-list"
      title=" Invoice List"
    >
      <template #append>
        <!-- 👉 Export invoice -->
        <VBtn>
          Export
          <VIcon
            end
            class="flip-in-rtl"
            icon="ri-arrow-right-line"
          />
        </VBtn>
      </template>

      <!-- SECTION Datatable -->
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :loading="isLoading"
        :items-length="totalInvoices"
        :headers="headers"
        :items="invoices"
        item-value="id"
        class="text-no-wrap text-sm rounded-0"
        @update:options="updateOptions"
      >
        <!-- Trending Header -->
        <template #header.trending>
          <VIcon
            size="22"
            icon="ri-arrow-up-line"
          />
        </template>

        <!-- id -->
        <template #item.id="{ item }">
          <NuxtLink :to="{ name: 'apps-invoice-preview-id', params: { id: item.id } }">
            #{{ item.id }}
          </NuxtLink>
        </template>

        <!-- trending -->
        <template #item.trending="{ item }">
          <VTooltip>
            <template #activator="{ props }">
              <VAvatar
                :size="28"
                v-bind="props"
                :color="resolveInvoiceStatusVariantAndIcon(item.invoiceStatus).variant"
                variant="tonal"
              >
                <VIcon
                  :size="16"
                  :icon="resolveInvoiceStatusVariantAndIcon(item.invoiceStatus).icon"
                />
              </VAvatar>
            </template>
            <p class="mb-0">
              {{ item.invoiceStatus }}
            </p>
            <p class="mb-0">
              Balance: {{ item.balance }}
            </p>
            <p class="mb-0">
              Due date: {{ item.dueDate }}
            </p>
          </VTooltip>
        </template>

        <!-- Total -->
        <template #item.total="{ item }">
          ${{ item.total }}
        </template>

        <!-- issued Date -->
        <template #item.date="{ item }">
          {{ item.issuedDate }}
        </template>

        <!-- Balance -->
        <template #item.balance="{ item }">
          <VChip
            v-if="typeof ((resolveInvoiceBalanceVariant(item.balance, item.total)).status) === 'string'"
            :color="resolveInvoiceBalanceVariant(item.balance, item.total).chip.color"
          >
            {{ (resolveInvoiceBalanceVariant(item.balance, item.total)).status }}
          </VChip>
          <span
            v-else
            class="text-sm text-high-emphasis"
          >
            {{ Number((resolveInvoiceBalanceVariant(item.balance, item.total)).status) > 0 ? `$${(resolveInvoiceBalanceVariant(item.balance, item.total)).status}` : `-$${Math.abs(Number((resolveInvoiceBalanceVariant(item.balance, item.total)).status))}` }}
          </span>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <IconBtn
            size="small"
            @click="deleteInvoice(item.id)"
          >
            <VIcon icon="ri-delete-bin-7-line" />
          </IconBtn>

          <IconBtn
            size="small"
            :to="{ name: 'apps-invoice-preview-id', params: { id: item.id } }"
          >
            <VIcon icon="ri-eye-line" />
          </IconBtn>

          <IconBtn size="small">
            <VIcon icon="ri-more-2-line" />
            <VMenu activator="parent">
              <VList
                :items="computedMoreList(item.id)"
                item-props
              />
            </VMenu>
          </IconBtn>
        </template>

        <!-- Pagination -->
        <template #bottom>
          <VDivider />

          <div class="d-flex justify-end flex-wrap gap-x-6 px-2 py-1">
            <div class="d-flex align-center gap-x-2 text-medium-emphasis text-base">
              Rows Per Page:
              <VSelect
                v-model="itemsPerPage"
                class="per-page-select"
                variant="plain"
                :items="[10, 20, 25, 50, 100]"
              />
            </div>

            <p class="d-flex align-center text-base text-high-emphasis me-2 mb-0">
              {{ paginationMeta({ page, itemsPerPage }, totalInvoices) }}
            </p>

            <div class="d-flex gap-x-2 align-center me-2">
              <VBtn
                class="flip-in-rtl"
                icon="ri-arrow-left-s-line"
                variant="text"
                density="comfortable"
                color="high-emphasis"
                :disabled="page <= 1"
                @click="page <= 1 ? page = 1 : page--"
              />

              <VBtn
                class="flip-in-rtl"
                icon="ri-arrow-right-s-line"
                density="comfortable"
                variant="text"
                color="high-emphasis"
                :disabled="page >= Math.ceil(totalInvoices / itemsPerPage)"
                @click="page >= Math.ceil(totalInvoices / itemsPerPage) ? page = Math.ceil(totalInvoices / itemsPerPage) : page++ "
              />
            </div>
          </div>
        </template>
      </VDataTableServer>
      <!-- !SECTION -->
    </VCard>
  </section>
</template>

<style lang="scss">
#invoice-list {
  .invoice-list-actions {
    inline-size: 8rem;
  }

  .invoice-list-search {
    inline-size: 12rem;
  }
}
</style>
