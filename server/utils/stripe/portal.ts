export function createStripeSelfServicePortal(customerId: string, currentPath: string) {
  return stripeAdmin.billingPortal.sessions.create({
    customer: customerId,
    return_url: getURL(currentPath),
  })
}
