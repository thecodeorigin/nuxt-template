export function getStripeProduct(productId: string) {
  return tryWithCache(
    getStorageStripeKey(`product:${productId}`),
    () => stripeAdmin.products.retrieve(productId),
  )
}

export function getStripeAllProducts() {
  return tryWithCache(
    getStorageStripeKey(`product:all`),
    () => stripeAdmin.products.search({
      query: `metadata[\'lookup_key\']:\'${process.env.STRIPE_PRODUCT_LOOKUP_KEY}\'`,
    }),
  )
}

export function createStripeProduct(payload: {
  name: string
  description: string
  features: string[]
}) {
  return stripeAdmin.products.create({
    name: payload.name,
    metadata: {
      lookup_key: process.env.STRIPE_PRODUCT_LOOKUP_KEY!,
    },
    description: payload.description,
    marketing_features: payload.features.map(feature => ({ name: feature })),
  })
}

export function updateStripeProduct(productId: string, payload: {
  name: string
  description: string
  features: string[]
}) {
  clearCache(getStorageStripeKey(`product:${productId}`))

  return stripeAdmin.products.update(productId, {
    name: payload.name,
    description: payload.description,
    marketing_features: payload.features.map(feature => ({ name: feature })),
  })
}

export function deleteStripeProduct(productId: string) {
  return stripeAdmin.products.del(productId)
}
