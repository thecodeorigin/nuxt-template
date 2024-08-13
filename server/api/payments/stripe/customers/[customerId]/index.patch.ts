export default defineEventHandler(async (event) => {
  const { customerId } = await defineEventOptions(event, { auth: true, params: ['customerId'] })

  const body = await readBody(event)

  return await updateStripeCustomer(customerId, body)
})
