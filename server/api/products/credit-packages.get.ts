export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event)

    const { getCreditPackages } = useProduct()

    const creditPackages = await getCreditPackages()

    return { data: creditPackages }
  }
  catch (error: any) {
    logger.error('[Products API] Error fetching products:', error)

    throw parseError(error)
  }
})
