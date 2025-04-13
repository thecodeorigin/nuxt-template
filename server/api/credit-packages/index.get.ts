export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event)

    const { getCreditPackages } = useCreditPackage()

    const prices = await getCreditPackages()

    return { data: prices }
  }
  catch (error: any) {
    logger.error('[Credit Packages API] Error fetching credit packages:', error)

    throw parseError(error)
  }
})
