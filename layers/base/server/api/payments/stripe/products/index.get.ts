export default defineEventHandler(async (event) => {
  await defineEventOptions(event, { auth: true })

  const { data } = await getStripeAllProducts()

  return data
})
