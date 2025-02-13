<script setup>
const { data } = useLazyAsyncData(async () => await $api('/api/credit'))
const authStore = useAuthStore()
const packages = computed(() => data.value?.map(pkg => (
  {
    ...pkg,
    price: new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(pkg.price),
  }
)) || [])
const paymentMethod = ref('')
const packageId = ref('')
const paymentStore = usePaymentStore()
async function checkout() {
  const { paymentUrl } = await paymentStore.checkout(paymentMethod.value, `credit:${packageId.value}`)
  window.location.href = paymentUrl
}
</script>
<template>
  <UDashboardPanelContent class="pb-24">
    <h2>Your credit</h2>
    <div>
      <UBadge class="w-fit">
        <UIcon name="i-heroicons-currency-dollar" size="28" />
        {{ authStore.currentUser.custom_data?.credit || 0 }}
      </UBadge>
    </div>
    <h2>Select your package</h2>
    <div class="flex items-center justify-between flex-wrap">
      <div v-for="pkg in packages" :key="pkg.id" class="w-1/3 mb-2 p-2">
        <UButton class="w-full flex-col gap-2 text-xl" color="primary" :variant="packageId === pkg.id ? 'solid' : 'outline'" @click="packageId = pkg.id">
          <div class="flex items-center gap-1">
            <UIcon name="i-heroicons-currency-dollar" size="28" />
            {{ pkg.amount }}
          </div>
          <div>
            {{ pkg.price }}
          </div>
        </UButton>
      </div>
    </div>
    <h2>
      Select your payment method
    </h2>
    <div class="flex items-center justify-between flex-wrap">
      <div class="w-1/2 p-2">
        <UButton class="w-full text-xl justify-center" :variant="paymentMethod === 'vnpay' ? 'solid' : 'outline'" color="primary" @click="paymentMethod = 'vnpay'">
          VNPAY
        </UButton>
      </div>
      <div class="w-1/2 p-2">
        <UButton class="w-full text-xl justify-center" :variant="paymentMethod === 'payos' ? 'solid' : 'outline'" color="primary" @click="paymentMethod = 'payos'">
          PAYOS
        </UButton>
      </div>
    </div>
    <div class="mt-4">
      <UButton class="w-full p-6 text-xl justify-center" color="primary" @click="checkout">
        Checkout
      </UButton>
    </div>
  </UDashboardPanelContent>
</template>
