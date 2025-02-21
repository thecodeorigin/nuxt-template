import type Stripe from 'stripe'

export const useStripeStore = defineStore('stripe', () => {
  const stripePrices = ref<Stripe.Price[]>([])

  async function fetchStripeProductPrices() {
    if (stripePrices.value && stripePrices.value.length > 0) {
      return stripePrices.value
    }

    const { data: products } = await $api<{ data?: Stripe.Product[] }>('/api/payments/stripe/products')

    if (!products?.[0])
      return []

    const res = await $api<{ data?: Stripe.Price[] }>(`/api/payments/stripe/products/${products?.[0].id}/prices`)

    stripePrices.value = res.data || []

    return stripePrices.value
  }

  return {
    stripePrices,
    fetchStripeProductPrices,
  }
})
