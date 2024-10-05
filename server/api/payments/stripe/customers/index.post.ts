export default defineEventHandler(async (event) => {
  await defineEventOptions(event, { auth: true })

  const body = await readBody(event)

  return await createStripeCustomer({
    name: body.name,
    email: body.email,
    phone: body.phone,
  })
})
