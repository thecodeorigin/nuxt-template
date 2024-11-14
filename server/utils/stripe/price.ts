// TODO: remove this
export function getStripeFreePrices(productUId: string) {
  return tryWithCache(
    getStorageStripeKey(`product:${productUId}:price:free`),
    async () => {
      const response = await stripeAdmin.prices.list({
        product: productUId,
        lookup_keys: ['free'],
      })

      return response.data
    },
  )
}

export function getStripeAllPrices(productUId: string) {
  return tryWithCache(
    getStorageStripeKey(`product:${productUId}:price:all`),
    async () => {
      const response = await stripeAdmin.prices.list({
        product: productUId,
      })

      return response.data
    },
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
