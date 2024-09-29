export default defineEventHandler(async (event) => {
  const { subscriptionId } = await defineEventOptions(event, {
    auth: true,
    params: [
      'customerId',
      'subscriptionId',
    ],
  })

  return await cancelStripeSubscription(subscriptionId)
})
