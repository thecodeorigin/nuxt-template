import { useNitroApp } from 'nitropack/runtime'

export default defineEventHandler(async (event) => {
  const nitroApp = useNitroApp()
  await defineEventOptions(event, { auth: true })

  const body = await readBody(event)

  const response = await createStripeCustomer({
    name: body.name,
    email: body.email,
    phone: body.phone,
  })

  nitroApp.hooks.callHook('log:info', {
    message: 'Stripe customer created',
    data: response,
  })

  return response
})
