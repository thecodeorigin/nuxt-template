export default defineEventHandler(async (event) => {
  await defineEventOptions(event, { auth: true })

  const body = await readBody(event)

  return await createStripePrice({
    currency: body.currency,
    amount: body.amount,
    recurring: body.recurring,
    lookup_key: body.lookup_key,
    product: body.product,
  })
})
