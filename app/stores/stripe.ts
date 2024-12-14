import type Stripe from 'stripe'

export const useStripeStore = defineStore('stripe', () => {
  const stripeProducts = ref<Stripe.Product[]>([])
  const stripePrices = ref<Record<Stripe.Product['id'], Stripe.Price[]>>({})

  async function fetchStripeProductPrices() {
    stripeProducts.value = await $api<Stripe.Product[]>('/api/payments/stripe/products')

    for (const product of stripeProducts.value) {
      stripePrices.value[product.id] = await $api<Stripe.Price[]>(`/api/payments/stripe/products/${product.id}/prices`)
    }

    return stripePrices.value
  }

  return {
    stripeProducts,
    stripePrices,
    fetchStripeProductPrices,
  }
})
