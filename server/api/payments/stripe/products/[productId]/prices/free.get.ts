export default defineEventHandler(async (event) => {
  const { productId } = await defineEventOptions(event, { auth: true, params: ['productId'] })

  const prices = await getStripeFreePrices(productId)

  return prices
})
