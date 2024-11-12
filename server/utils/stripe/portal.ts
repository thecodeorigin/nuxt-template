export function createStripeSelfServicePortal(customerId: string, currentPath: string) {
  return tryWithCache(
    getStorageStripeKey(`customer:${customerId}:portal`),
    () => stripeAdmin.billingPortal.sessions.create({
      customer: customerId,
      return_url: getURL(currentPath),
    }),
  )
}
