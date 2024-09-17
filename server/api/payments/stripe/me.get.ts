export default defineEventHandler(async (event) => {
  const { session } = await defineEventOptions(event, { auth: true })

  const customer = await getStripeCustomerByEmail(session.user.email as string)

  const { data: subscriptions } = await getStripeCustomerSubscriptions(customer.id)

  return {
    customer,
    subscriptions,
  }
})
