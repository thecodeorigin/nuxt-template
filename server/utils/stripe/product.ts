export function getStripeProduct(productUId: string) {
  return tryWithCache(
    getStorageStripeKey(`product:${productUId}`),
    () => getStripeAdmin().products.retrieve(productUId),
  )
}

export function getStripeAllProducts() {
  return tryWithCache(
    getStorageStripeKey(`product:all`),
    async () => {
      const response = await getStripeAdmin().products.search({
        query: `metadata[\'lookup_key\']:\'${process.env.STRIPE_PRODUCT_LOOKUP_KEY}\'`,
      })

      return response.data
    },
  )
}

export function createStripeProduct(payload: {
  name: string
  description: string
  features: string[]
}) {
  return getStripeAdmin().products.create({
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

  return getStripeAdmin().products.update(productUId, {
    name: payload.name,
    description: payload.description,
    marketing_features: payload.features.map(feature => ({ name: feature })),
  })
}

export function deleteStripeProduct(productUId: string) {
  return getStripeAdmin().products.del(productUId)
}
