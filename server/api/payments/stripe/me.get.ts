export default defineEventHandler(async (event) => {
  const { session } = await defineEventOptions(event, { auth: true })

  return await getStripeCustomerByEmail(session.user.email as string)
})
