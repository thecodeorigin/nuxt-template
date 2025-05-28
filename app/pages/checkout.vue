<script setup lang="ts">
import { parseQuery } from 'ufo'
import { PaymentStatus } from '@base/server/db/schemas'

definePageMeta({
  middleware(to) {
    if (!to.query.qr) {
      return navigateTo({ path: '/pricing' })
    }
  },
})

const { data: page } = await useAsyncData('pricing', () => queryCollection('pricing').first())

useSeoMeta({
  title: page.value?.title,
  ogTitle: page.value?.title,
  description: page.value?.description,
  ogDescription: page.value?.description,
})

defineOgImageComponent('Saas')

const { t } = useI18n()

const route = useRoute()

const checkoutQr = computed(() => String(route.query.qr))
const checkoutInfo = computed(() => {
  const query = parseQuery(checkoutQr.value.split('?')[1] || '')

  return query
})

const paymentApi = useApiPayment()

const { data, error, execute: handleCheckStatus } = useAsyncData(
  'checkoutInfo',
  () => paymentApi.checkStatus('sepay', String(checkoutInfo.value.des)),
  { server: false, immediate: false },
)

whenever(error, (err) => {
  notifyError({
    content: getErrorMessage(err),
  })
})

whenever(data, (response) => {
  if (response?.data?.status === PaymentStatus.RESOLVED) {
    navigateTo({ path: '/app' })
  }
  else {
    notifyWarning({
      content: t('We have not received your payment yet. Please try again later, or contact support if the issue persists.'),
    })
  }
}, { immediate: true })
</script>

<template>
  <div v-if="page">
    <UPageSection
      :title="page.topup.title"
      :description="page.topup.description"
    >
      <UBanner
        icon="i-lucide-triangle-alert"
        color="warning"
        :title="$t('Modification of the transaction is prohibited and could potentially lead to account suspension!')"
      />

      <div class="grid md:grid-cols-2 gap-4 items-start">
        <div class="flex justify-center">
          <img
            :src="String($route.query.qr)"
            alt="QR Code for payment"
            class="rounded-lg shadow-xl max-w-sm w-full"
          >
        </div>

        <UCard class="w-full">
          <template #header>
            <h3 class="text-xl font-semibold leading-6 text-gray-900 dark:text-white">
              {{ $t('Payment Summary') }}
            </h3>
          </template>

          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-lg font-medium text-gray-500 dark:text-gray-400">{{ $t('Bank Name') }}</span>
              <span class="text-lg font-semibold text-gray-900 dark:text-white">{{ checkoutInfo.bank }}</span>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-lg font-medium text-gray-500 dark:text-gray-400">{{ $t('Bank Number') }}</span>
              <span class="text-lg font-semibold text-gray-900 dark:text-white">{{ checkoutInfo.acc }}</span>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-lg font-medium text-gray-500 dark:text-gray-400">{{ $t('Amount') }}</span>
              <span class="text-xl font-bold text-primary-500 dark:text-primary-400">{{ new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND' }).format(Number(checkoutInfo.amount)) }}</span>
            </div>

            <div class="flex justify-between items-start">
              <span class="text-lg font-medium text-gray-500 dark:text-gray-400">{{ $t('Description') }}</span>
              <span class="text-lg text-gray-700 dark:text-gray-300 text-right">{{ checkoutInfo.des }}</span>
            </div>
          </div>

          <template #footer>
            <p class="text-lg text-gray-500 dark:text-gray-400">
              {{ $t('Please verify the details before proceeding with the payment.') }}
            </p>
            <div>
              <UButton
                class="w-full font-semibold mt-4" size="xl"
                @click="handleCheckStatus()"
              >
                {{ $t('I have transfered the money! (Click here)') }}
              </UButton>
            </div>
          </template>
        </UCard>
      </div>
    </UPageSection>

    <UPageSection
      :title="page.faq.title"
      :description="page.faq.description"
    >
      <UPageAccordion
        multiple
        class="max-w-4xl mx-auto"
        :items="page.faq.items"
      />
    </UPageSection>
  </div>
</template>
