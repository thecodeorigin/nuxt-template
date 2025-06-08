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
      const data = await useApiStripe().fetchStripeSubscription()
      customer.value = data.customer
      currentSubscription.value = data.subscription
      subscriptions.value = data.subscriptions
    }
    catch (error) {
      console.error(error)
    }
  }

  return {
    customer,
    subscriptions,
    isSubscriptionValid,
    currentSubscription,
    fetchSubscriptions,
  }
})
