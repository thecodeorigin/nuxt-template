export default defineEventHandler(async (event) => {
  const { priceId } = await defineEventOptions(event, { auth: true, params: ['priceId'] })

  return await getStripePrice(priceId)
})
