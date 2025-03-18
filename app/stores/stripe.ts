import type Stripe from 'stripe'

export const useStripeStore = defineStore('stripe', () => {
  const stripePrices = ref<Stripe.Price[]>([])

  const stripeApi = useApiStripe()

  async function fetchStripeProductPrices() {
    if (stripePrices.value && stripePrices.value.length > 0) {
      return stripePrices.value
    }

    const { data: products } = await stripeApi.fetchStripeProducts()

    if (!products?.[0])
      return []

    const res = await stripeApi.fetchStripePrices(products[0].id)

    stripePrices.value = res.data || []

    return stripePrices.value
  }

  return {
    stripePrices,
    fetchStripeProductPrices,
  }
})
