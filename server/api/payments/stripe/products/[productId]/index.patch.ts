export default defineEventHandler(async (event) => {
  const { productId } = await defineEventOptions(event, { auth: true, params: ['productId'] })

  const body = await readBody(event)

  return await updateStripeProduct(productId, {
    name: body.name,
    description: body.description,
    features: body.features,
  })
})
