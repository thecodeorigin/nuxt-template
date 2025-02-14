import type Stripe from 'stripe'

export const useStripeStore = defineStore('stripe', () => {
  const stripePrices = ref<Stripe.Price[]>([])
  const runtimeConfig = useRuntimeConfig()
  const stripeConfig = runtimeConfig.public.stripe

  async function fetchStripeProductPrices() {
    stripePrices.value = await $api<Stripe.Price[]>(`/api/payments/stripe/products/${stripeConfig.productId}/prices`)
    return stripePrices.value
  }

  return {
    stripePrices,
    fetchStripeProductPrices,
  }
})
