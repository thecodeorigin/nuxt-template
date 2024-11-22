export default defineEventHandler(async (event) => {
  const { customerId } = await defineEventOptions(event, { auth: true, params: ['customerId'] })

  const body = await readBody(event)

  const response = await createStripeSubscription(customerId, body.priceId)

  await logEventToTelegram({
    eventType: 'CREATE_STRIPE_SUBSCRIPTION',
    details: response,
  })

  return response
})
