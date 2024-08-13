export default defineEventHandler(async (event) => {
  const { priceId } = await defineEventOptions(event, { auth: true, params: ['priceId'] })

  const body = await readBody(event)

  return await updateStripePrice(priceId, {
    lookup_key: body.lookup_key,
    active: body.active,
  })
})
