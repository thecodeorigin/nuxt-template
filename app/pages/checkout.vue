<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const { t } = useI18n()

const { checkStatus } = useApiPayment()
const router = useRouter()
const route = useRoute()

const qr = computed(() => route.query.qr as string)

const paymentInfo = computed(() => ({
  account: route.query.acc as string,
  bank: route.query.bank as string,
  amount: Number(route.query.amount) || 0,
  description: route.query.des as string,
}))

const formattedAmount = computed(() =>
  paymentInfo.value.amount.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }),
)

async function handleCheckout() {
  const { data } = await checkStatus('sepay', paymentInfo.value.description)
  if (data.status === 'resolved') {
    notifyError({
      content: t('Payment successful'),
    })
    router.push('/settings/credit')
  }
  else {
    notifyError({
      content: t('We have not received your payment yet. Please try again later, or contact support if the issue persists.'),
    })
  }
}
</script>

<template>
  <VContainer class="py-4">
    <VRow justify="center">
      <VCol cols="12" md="8">
        <VCard class="pa-4">
          <VRow>
            <VCol cols="12" md="6" class="d-flex justify-center align-center">
              <VImg
                :src="qr"
                max-width="400"
                max-height="400"
                class="mx-auto"
                alt="QR Code"
              />
            </VCol>

            <VCol cols="12" md="6">
              <VCardText>
                <p class="text-h5 font-weight-bold mb-4">
                  {{ $t('Payment Information') }}
                </p>
                <p class="text-body-1 mb-2">
                  <strong>{{ $t('Bank') }}:</strong> {{ paymentInfo.bank }}
                </p>
                <p class="text-body-1 mb-2">
                  <strong>{{ $t('Account Number') }}:</strong> {{ paymentInfo.account }}
                </p>
                <p class="text-body-1 mb-2">
                  <strong>{{ $t('Amount') }}:</strong> {{ formattedAmount }}
                </p>
                <p class="text-body-1 mb-4">
                  <strong>{{ $t('Description') }}:</strong> {{ paymentInfo.description }}
                </p>
                <p class="text-body-2 mb-4">
                  {{ $t('Please scan the QR code or transfer the amount to the bank account to complete the payment.') }}
                </p>
                <VBtn
                  color="primary"
                  block
                  @click="handleCheckout"
                >
                  {{ $t('Confirm Payment') }}
                </VBtn>
              </VCardText>
            </VCol>
          </VRow>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<style scoped>
/* Đảm bảo layout responsive */
.v-img {
  border-radius: 8px;
}
</style>
