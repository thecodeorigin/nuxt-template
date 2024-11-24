import type Stripe from 'stripe'

export async function createStripeSubscription(customerUId: string, priceId: string) {
  const nitroApp = useNitroApp()

  const subscriptions = await getStripeCustomerSubscriptions(customerUId)

  if (subscriptions.length > 0) {
    const sub = subscriptions.find(s => s.items.data.some(i => i.price.id === priceId))

    if (sub?.status === 'paused') {
      await resumeStripeSubscription(subscriptions[0].id)
      nitroApp.hooks.callHook('logging:info', {
        message: 'Stripe subscription resumed',
        data: sub,
      })
    }

    return sub
  }
  else {
    return stripeAdmin.subscriptions.create({
      customer: customerUId,
      items: [{ price: priceId }],
      collection_method: 'charge_automatically',
    })
  }
}

export function updateStripeSubscription(subscriptionUId: string, subscription: Stripe.SubscriptionUpdateParams) {
  clearCache(getStorageStripeKey(`subscription:${subscriptionUId}`))

  return stripeAdmin.subscriptions.update(subscriptionUId, subscription)
}

export function cancelStripeSubscription(subscriptionUId: string) {
  clearCache(getStorageStripeKey(`subscription:${subscriptionUId}`))

  return stripeAdmin.subscriptions.cancel(subscriptionUId)
}

export function resumeStripeSubscription(subscriptionUId: string) {
  clearCache(getStorageStripeKey(`subscription:${subscriptionUId}`))

  return stripeAdmin.subscriptions.resume(subscriptionUId, {
    billing_cycle_anchor: 'now',
  })
}

export async function getStripeSubscriptionById(subscriptionUId: string) {
  return tryWithCache(
    getStorageStripeKey(`subscription:${subscriptionUId}`),
    () => stripeAdmin.subscriptions.retrieve(subscriptionUId),
  )
}
