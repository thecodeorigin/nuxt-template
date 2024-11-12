import type Stripe from 'stripe'

export async function createStripeSubscription(customerId: string, priceId: string) {
  const subscriptions = await getStripeCustomerSubscriptions(customerId)

  if (subscriptions.data.length > 0) {
    const sub = subscriptions.data.find(s => s.items.data.some(i => i.price.id === priceId))

    if (sub?.status === 'paused')
      await resumeStripeSubscription(subscriptions.data[0].id)

    return sub
  }
  else {
    return stripeAdmin.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      collection_method: 'charge_automatically',
    })
  }
}

export function updateStripeSubscription(subscriptionId: string, subscription: Stripe.SubscriptionUpdateParams) {
  clearCache(getStorageStripeKey(`subscription:${subscriptionId}`))

  return stripeAdmin.subscriptions.update(subscriptionId, subscription)
}

export function cancelStripeSubscription(subscriptionId: string) {
  clearCache(getStorageStripeKey(`subscription:${subscriptionId}`))

  return stripeAdmin.subscriptions.cancel(subscriptionId)
}

export function resumeStripeSubscription(subscriptionId: string) {
  clearCache(getStorageStripeKey(`subscription:${subscriptionId}`))

  return stripeAdmin.subscriptions.resume(subscriptionId, {
    billing_cycle_anchor: 'now',
  })
}

export async function getStripeSubscriptionById(subscriptionId: string) {
  return tryWithCache(
    getStorageStripeKey(`subscription:${subscriptionId}`),
    () => stripeAdmin.subscriptions.retrieve(subscriptionId),
  )
}
