export default defineEventHandler(async (event) => {
  await defineEventOptions(event, { auth: true })

  const body = await readBody(event)

  return await createStripeProduct({
    name: body.name,
    description: body.description,
    features: body.features.map((feature: string) => ({ name: feature })),
  })
})
