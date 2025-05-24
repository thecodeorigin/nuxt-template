<script setup lang="ts">
import { parseQuery } from 'ufo'

definePageMeta({
  middleware(to) {
    if (!to.query.qr) {
      return navigateTo({ name: 'pricing' })
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

const route = useRoute()

const checkoutQr = computed(() => String(route.query.qr))
const checkoutInfo = computed(() => {
  const query = parseQuery(checkoutQr.value)

  return query
})

function handleCheckStatus() {
  //
}
</script>

<template>
  <div v-if="page">
    <UPageSection
      :title="page.topup.title"
      :description="page.topup.description"
    >
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
            <UDivider />
            <div class="flex justify-between items-center">
              <span class="text-lg font-medium text-gray-500 dark:text-gray-400">{{ $t('Amount') }}</span>
              <span class="text-xl font-bold text-primary-500 dark:text-primary-400">{{ checkoutInfo.amount }}</span>
            </div>
            <UDivider />
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
                @click="handleCheckStatus"
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
