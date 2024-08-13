export default defineEventHandler(async (event) => {
  const { customerId } = await defineEventOptions(event, { auth: true, params: ['customerId'] })

  const { data } = await getStripeCustomerSubscriptions(customerId)

  return data
})
