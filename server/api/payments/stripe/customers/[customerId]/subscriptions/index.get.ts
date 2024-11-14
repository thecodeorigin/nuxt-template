export default defineEventHandler(async (event) => {
  const { customerId } = await defineEventOptions(event, { auth: true, params: ['customerId'] })

  return await getStripeCustomerSubscriptions(customerId)
})
