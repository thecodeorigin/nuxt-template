export default defineEventHandler(async (event) => {
  const { session } = await defineEventOptions(event, { auth: true })

  const { email } = session.user

  const body = await readBody(event)

  const stripeCustomer = await getStripeCustomerByEmail(email!)

  const { url } = await createStripeSelfServicePortal(stripeCustomer.id, body.redirectPath)

  return sendRedirect(event, url)
})
