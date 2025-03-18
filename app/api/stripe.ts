export function useApiStripe() {
  function fetchStripeProducts() {
    return $api('/api/payments/stripe/products')
  }

  function fetchStripePrices(productId: string) {
    return $api(`/api/payments/stripe/products/${productId}/prices`)
  }

  function fetchStripeSubscription() {
    return $api('/api/payments/stripe/me')
  }

  async function createSubscriptionCheckoutUrl(customerId: string, priceId: string) {
    return $api<{ url: string }>(`/api/payments/stripe/customers/${customerId}/checkout`, {
      method: 'POST',
      body: {
        priceId,
        redirectPath: '/settings/billing-plans',
      },
    })
  }

  return {
    fetchStripeProducts,
    fetchStripePrices,
    fetchStripeSubscription,
    createSubscriptionCheckoutUrl,
  }
}
