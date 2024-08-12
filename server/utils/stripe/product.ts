export function getStripeProduct(productId: string) {
  return stripeAdmin.products.retrieve(productId)
}

export function createStripeProduct(payload: {
  name: string
  description: string
  features: string[]
}) {
  return stripeAdmin.products.create({
    name: payload.name,
    description: payload.description,
    marketing_features: payload.features.map(feature => ({ name: feature })),
  })
}

export function updateStripeProduct(productId: string, payload: {
  name: string
  description: string
  features: string[]
}) {
  return stripeAdmin.products.update(productId, {
    name: payload.name,
    description: payload.description,
    marketing_features: payload.features.map(feature => ({ name: feature })),
  })
}

export function deleteStripeProduct(productId: string) {
  return stripeAdmin.products.del(productId)
}
