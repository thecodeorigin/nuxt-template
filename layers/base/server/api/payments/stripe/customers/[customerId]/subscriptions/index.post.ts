export default defineEventHandler(async (event) => {
  const { customerId } = await defineEventOptions(event, { auth: true, params: ['customerId'] })

  const body = await readBody(event)

  return await createStripeSubscription(customerId, body.priceId)
})
