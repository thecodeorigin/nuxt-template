export default defineEventHandler(async (event) => {
  const { productId } = await defineEventOptions(event, { auth: false, params: ['productId'] })

  const prices = await getStripeAllPrices(productId)

  return { data: prices }
})
