export function getStripeProduct(productUId: string) {
  return tryWithCache(
    getStorageStripeKey(`product:${productUId}`),
    () => stripeAdmin.products.retrieve(productUId),
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

export function updateStripeProduct(productUId: string, payload: {
  name: string
  description: string
  features: string[]
}) {
  clearCache(getStorageStripeKey(`product:${productUId}`))

  return stripeAdmin.products.update(productUId, {
    name: payload.name,
    description: payload.description,
    marketing_features: payload.features.map(feature => ({ name: feature })),
  })
}

export function deleteStripeProduct(productUId: string) {
  return stripeAdmin.products.del(productUId)
}
