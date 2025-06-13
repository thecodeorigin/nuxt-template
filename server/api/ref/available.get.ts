export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const { getAvailableReferencesByUserId } = useReference()

    return getAvailableReferencesByUserId(session.id)
  }
  catch (error: any) {
    logger.error('[Reference API] Error fetching available references:', error)

    throw parseError(error)
  }
})
