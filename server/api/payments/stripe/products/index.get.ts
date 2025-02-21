export default defineEventHandler(async (event) => {
  await defineEventOptions(event, { auth: true })

  const products = await getStripeAllProducts()

  return { data: products }
})
