import type Stripe from 'stripe'

export const useSubscriptionStore = defineStore('subscription', () => {
  const currentSubscription = ref<Stripe.Subscription>()
  const subscriptions = ref<Stripe.Subscription[]>([])
  const customer = ref<Stripe.Customer>()

  const isSubscriptionValid = computed(() => currentSubscription.value
    && (
      currentSubscription.value.status === 'active'
      || currentSubscription.value.status === 'trialing'
    ),
  )

  async function fetchSubscriptions() {
    try {
      const data = await $api<{ customer: Stripe.Customer, subscription: Stripe.Subscription, subscriptions: Stripe.Subscription[] }>('/payments/stripe/me')
      customer.value = data.customer
      currentSubscription.value = data.subscription
      subscriptions.value = data.subscriptions
    }
    catch (error) {
      console.error(error)
    }
  }

  async function createSubscriptionCheckoutUrl(customerId: string, priceId: string) {
    return $api<{ url: string }>(`/payments/stripe/customers/${customerId}/checkout`, {
      method: 'POST',
      body: {
        priceId,
        redirectPath: '/pricing?success=true',
      },
    })
  }

  return {
    customer,
    subscriptions,
    isSubscriptionValid,
    currentSubscription,
    fetchSubscriptions,
    createSubscriptionCheckoutUrl,
  }
})
