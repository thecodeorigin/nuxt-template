export default defineEventHandler(async (event) => {
  const { session } = await defineEventOptions(event, { auth: true })

  const { email } = session.user

  const body = await readBody(event)

  const stripeCustomer = await getStripeCustomerByEmail(email!)

  const { url } = await createStripeCheckoutSession(stripeCustomer.id, body.priceId, body.redirectPath)

  if (!url) {
    throw createError({
      status: 400,
      message: 'Cannot create Stripe Checkout session',
    })
  }

  return sendRedirect(event, url)
})
