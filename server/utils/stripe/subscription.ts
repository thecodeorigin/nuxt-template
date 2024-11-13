import type Stripe from 'stripe'

export async function createStripeSubscription(customerUId: string, priceId: string) {
  const subscriptions = await getStripeCustomerSubscriptions(customerUId)

  if (subscriptions.data.length > 0) {
    const sub = subscriptions.data.find(s => s.items.data.some(i => i.price.id === priceId))

    if (sub?.status === 'paused')
      await resumeStripeSubscription(subscriptions.data[0].id)

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
