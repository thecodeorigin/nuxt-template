export default defineEventHandler(async (event) => {
  const { customerId } = await defineEventOptions(event, { auth: true, params: ['customerId'] })

  const body = await readBody(event)

  const { url } = await createStripeCheckoutSession(customerId, body.priceId, body.redirectPath)

  if (!url) {
    throw createError({
      status: 400,
      message: 'Cannot create Stripe Checkout session',
    })
  }

  return {
    url,
  }
})
