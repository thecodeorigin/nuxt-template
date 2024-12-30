<script setup lang="ts">
definePageMeta({
  sidebar: {
    order: 0,
    label: 'Home',
    icon: 'i-heroicons-home',
    tooltip: {
      text: 'Home',
      shortcuts: ['G', 'H'],
    },
  },
})
const authStore = useAuthStore()
const paymentStore = usePaymentStore()

async function vnpay() {
  const { paymentUrl } = await paymentStore.checkout('vnpay', 'product:12lhiaego784hatl')
  window.open(paymentUrl, '_blank')
}

async function payos() {
  const { paymentUrl } = await paymentStore.checkout('payos', 'product:12lhiaego784hatl')
  window.open(paymentUrl, '_blank')
}
</script>

<template>
  <UDashboardPanelContent>
    <p>
      {{ authStore.accessToken }}
    </p>
    <div>
      <button @click="payos">
        Create PAYOS payment
      </button>

      <br>

      <button @click="vnpay">
        Create VNPAY payment
      </button>
    </div>

    <div>
      <button @click="authStore.signIn">
        signin
      </button>
    </div>

    <div class="">
      <button @click="authStore.signOut">
        signout
      </button>
    </div>
  </UDashboardPanelContent>
</template>
