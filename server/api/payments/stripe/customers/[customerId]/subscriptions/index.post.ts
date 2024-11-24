export default defineEventHandler(async (event) => {
  const nitroApp = useNitroApp()
  const { customerId } = await defineEventOptions(event, { auth: true, params: ['customerId'] })

  const body = await readBody(event)

  const response = await createStripeSubscription(customerId, body.priceId)

  nitroApp.hooks.callHook('logging:info', {
    message: 'Stripe subscription created',
    data: response,
  })

  return response
})
