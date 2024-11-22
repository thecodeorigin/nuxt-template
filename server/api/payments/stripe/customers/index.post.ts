export default defineEventHandler(async (event) => {
  await defineEventOptions(event, { auth: true })

  const body = await readBody(event)

  const response = await createStripeCustomer({
    name: body.name,
    email: body.email,
    phone: body.phone,
  })

  await logEventToTelegram({
    eventType: 'CREATE_STRIPE_CUSTOMER',
    details: response,
  })

  return response
})
