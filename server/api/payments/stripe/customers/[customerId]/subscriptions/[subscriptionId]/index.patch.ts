export default defineEventHandler(async (event) => {
  const { subscriptionId } = await defineEventOptions(event, {
    auth: true,
    params: [
      'customerId',
      'subscriptionId',
    ],
  })

  const body = await readBody(event)

  return await updateStripeSubscription(subscriptionId, body)
})
