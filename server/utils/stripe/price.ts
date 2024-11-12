// TODO: remove this
export function getStripeFreePrices(productId: string) {
  return tryWithCache(
    getStorageStripeKey(`product:${productId}:price:free`),
    () => stripeAdmin.prices.list({
      product: productId,
      lookup_keys: ['free'],
    }),
  )
}

export function getStripeAllPrices(productId: string) {
  return tryWithCache(
    getStorageStripeKey(`product:${productId}:price:all`),
    () => stripeAdmin.prices.list({
      product: productId,
    }),
  )
}

export function getStripePrice(priceId: string) {
  return tryWithCache(
    getStorageStripeKey(`price:${priceId}`),
    () => stripeAdmin.prices.retrieve(priceId),
  )
}

export function createStripePrice(payload: {
  currency: string
  amount: number
  recurring?: {
    interval: 'day' | 'week' | 'month' | 'year'
    interval_count: number
  }
  lookup_key: 'free' | 'basic' | 'premium' | 'custom'
  product: string
  active?: boolean
}) {
  return stripeAdmin.prices.create({
    currency: payload.currency,
    unit_amount: payload.amount,
    recurring: payload.recurring && {
      interval: payload.recurring.interval,
      interval_count: payload.recurring.interval_count,
    },
    lookup_key: payload.lookup_key,
    product: payload.product,
    active: typeof payload.active === 'boolean' ? payload.active : true,
  })
}

export function updateStripePrice(priceId: string, payload: {
  lookup_key: 'free' | 'basic' | 'premium' | 'custom'
  active?: boolean
}) {
  clearCache(getStorageStripeKey(`price:${priceId}`))

  return stripeAdmin.prices.update(priceId, {
    lookup_key: payload.lookup_key,
    active: typeof payload.active === 'boolean' ? payload.active : true,
  })
}
