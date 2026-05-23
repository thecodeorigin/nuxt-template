<script setup lang="ts">
import { useBillingApi } from '#layers/billing/app/api/useBillingApi'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [boolean], 'success': [] }>()

const billingApi = useBillingApi()
const toast = useToast()

const AMOUNTS = [50000, 100000, 200000, 500000]
const selectedAmount = ref(AMOUNTS[1]!)
const checking = ref(false)
const paid = ref(false)
const txId = ref<string | null>(null)
const qrUrl = ref<string | null>(null)
const bank = ref<{ bankName: string, accountNumber: string, prefix: string } | null>(null)
const orderCode = ref<string | null>(null)

const { pause, resume } = useIntervalFn(async () => {
  if (!txId.value)
    return
  try {
    const { status } = await billingApi.fetchTransactionStatus(txId.value)
    if (status === 'success') {
      pause()
      paid.value = true
      emit('success')
    }
  }
  catch {}
}, 3000, { immediate: false })

async function startCheckout() {
  checking.value = true
  try {
    const result = await billingApi.checkout(selectedAmount.value)
    txId.value = result.transactionId
    qrUrl.value = result.qrUrl
    bank.value = result.bank
    orderCode.value = result.orderCode
    resume()
    setTimeout(pause, 5 * 60 * 1000)
  }
  catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    toast.add({ title: 'Checkout failed', description: e?.data?.statusMessage ?? 'Unknown error', color: 'error' })
  }
  finally {
    checking.value = false
  }
}

function close() {
  pause()
  txId.value = null
  qrUrl.value = null
  bank.value = null
  orderCode.value = null
  paid.value = false
  emit('update:open', false)
}

watch(() => props.open, (val) => {
  if (!val)
    close()
})
</script>

<template>
  <UModal :open="open" title="Top up balance" @update:open="emit('update:open', $event)">
    <template #body>
      <div v-if="paid" class="text-center py-6">
        <UIcon name="i-lucide-circle-check" class="size-12 text-success mx-auto mb-3" />
        <p class="font-semibold text-lg">
          Payment received!
        </p>
        <p class="text-sm text-muted mt-1">
          Your balance has been updated.
        </p>
      </div>
      <div v-else-if="qrUrl" class="space-y-4">
        <div class="text-center">
          <img :src="qrUrl" alt="SePay QR code" class="mx-auto max-w-[200px] rounded">
        </div>
        <div class="text-sm space-y-1 bg-elevated rounded p-3">
          <p><span class="text-muted">Bank:</span> {{ bank?.bankName }}</p>
          <p><span class="text-muted">Account:</span> {{ bank?.accountNumber }}</p>
          <p><span class="text-muted">Memo:</span> <code class="font-mono">{{ bank?.prefix }}{{ orderCode }}</code></p>
        </div>
        <p class="text-xs text-muted text-center">
          Waiting for payment confirmation…
        </p>
      </div>
      <div v-else class="space-y-4">
        <p class="text-sm text-muted">
          Select the amount to top up:
        </p>
        <div class="grid grid-cols-2 gap-2">
          <UButton
            v-for="amt in AMOUNTS"
            :key="amt"
            :variant="selectedAmount === amt ? 'solid' : 'outline'"
            color="neutral"
            block
            @click="selectedAmount = amt"
          >
            {{ amt.toLocaleString('vi-VN') }} ₫
          </UButton>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="ghost" label="Close" @click="close()" />
        <UButton v-if="!qrUrl && !paid" label="Generate QR" :loading="checking" @click="startCheckout()" />
      </div>
    </template>
  </UModal>
</template>
