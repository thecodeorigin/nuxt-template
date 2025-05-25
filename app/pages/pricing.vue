<script setup lang="ts">
const { data: page } = await useAsyncData('pricing', () => queryCollection('pricing').first())

useSeoMeta({
  title: page.value?.title,
  ogTitle: page.value?.title,
  description: page.value?.description,
  ogDescription: page.value?.description,
})

defineOgImageComponent('Saas')

const { data: products } = useAsyncData('credit-packages', () => useApiProduct().fetchCreditPackages(), {
  transform(data) {
    return data.data
  },
})

const HIGHLIGHTED_PRICE = Number(import.meta.env.NUXT_APP_HIGHLIGHTED_PRICE || 0)

function checkHighlightedPrice(price: number, index?: number) {
  if (HIGHLIGHTED_PRICE)
    return price === HIGHLIGHTED_PRICE
  else
    return index === 1
}

const selectedPriceId = ref<string | null>(null)
const selectedPrice = computed(() => products.value?.find((plan: any) => plan.id === selectedPriceId.value))

const paymentApi = useApiPayment()

const authStore = useAuthStore()

const pendingPaymentPrice = useLocalStorage('pendingPaymentPrice', '')

async function handleBuyCredit(productId: string) {
  selectedPriceId.value = productId

  const topup = document.getElementById('topup')

  window.scrollTo({
    top: Number(topup?.getBoundingClientRect().top),
    behavior: 'smooth',
  })

  await new Promise(resolve => setTimeout(resolve, 500))

  useAnimate(topup, [
    { transform: 'translate(0, 0) rotate(0deg)' },
    { transform: 'translate(20px, -20px) rotate(10deg)' },
    { transform: 'translate(-20px, 25px) rotate(-12deg)' },
    { transform: 'translate(25px, 20px) rotate(15deg)' },
    { transform: 'translate(-25px, -20px) rotate(-15deg)' },
    { transform: 'translate(30px, -25px) rotate(12deg)' },
    { transform: 'translate(-30px, 30px) rotate(-10deg)' },
    { transform: 'translate(15px, -15px) rotate(8deg)' },
    { transform: 'translate(-10px, 10px) rotate(-5deg)' },
    { transform: 'translate(0, 0) rotate(0deg)' },
  ], 500)
}

function handleContact() {
  //
}

async function handleCheckout() {
  const productIdentifier = `credit:${selectedPriceId.value}`

  if (!authStore.currentUser) {
    pendingPaymentPrice.value = productIdentifier

    await navigateTo({ path: '/sign-in' }, { external: true })
  }

  const { data: checkoutData } = await paymentApi.checkout('sepay', productIdentifier)

  navigateTo({
    path: '/checkout',
    query: {
      qr: checkoutData.paymentUrl,
    },
  })
}

tryOnBeforeMount(async () => {
  if (!selectedPriceId.value)
    selectedPriceId.value = products.value?.[1]?.id || null

  if (pendingPaymentPrice.value) {
    const isProcessing = Boolean(pendingPaymentPrice.value)

    if (isProcessing) {
      const { data: checkoutData } = await paymentApi.checkout('sepay', pendingPaymentPrice.value)
      pendingPaymentPrice.value = null

      navigateTo({
        path: '/checkout',
        query: {
          qr: checkoutData.paymentUrl,
        },
      })
    }
  }
})
</script>

<template>
  <div v-if="page">
    <UPageSection
      :title="page.topup.title"
      :description="page.topup.description"
    >
      <UFormField
        :description="$t('Get started by selecting a credit package.')"
        :help="$t('It\'s recommended to topup twice the amount of your instance monthly consumption.')"
        size="xl"
      >
        <ClientOnly>
          <div class="flex items-center space-x-4">
            <USelect
              v-model="selectedPriceId"
              :items="products || []"
              value-key="id"
              label-key="title"
              size="xl"
              :placeholder="$t('Select a credit package')"
              class="flex-1"
            >
              <template #item="{ item }">
                {{ item.title }}

                <span class="text-gray-500">{{ formatPrice(item.price, item.currency) }} / {{ item.amount }} credits</span>
              </template>
            </USelect>

            <UButton id="topup" size="lg" color="neutral" trailing-icon="i-lucide-rocket" @click="handleCheckout">
              <b>{{ $t('Buy') }} {{ selectedPrice?.amount || 0 }} credits</b>
              ({{ formatPrice(selectedPrice?.amount || 0, selectedPrice?.currency || 'VND') }})
            </UButton>
          </div>
        </ClientOnly>
      </UFormField>
    </UPageSection>

    <UContainer>
      <UPricingPlans v-if="products?.length" scale style="--count: 3">
        <PricingItem
          v-for="(plan, index) in products || []"
          :key="index"
          :index="index"
          :highlight="checkHighlightedPrice(Number(plan.price), index)"
          :product="plan"
          @buy="handleBuyCredit"
          @contact="handleContact"
        />
      </UPricingPlans>
      <p v-else>
        No credit package available. Please contact us for more information.
      </p>
    </UContainer>

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
