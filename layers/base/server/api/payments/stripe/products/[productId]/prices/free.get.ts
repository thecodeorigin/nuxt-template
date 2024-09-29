export default defineEventHandler(async (event) => {
  const { productId } = await defineEventOptions(event, { auth: true, params: ['productId'] })

  const { data } = await getStripeFreePrices(productId)

  return data
})
