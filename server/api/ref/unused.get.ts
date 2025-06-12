export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const { getUnusedReferencesByUserId } = useReference()

    return getUnusedReferencesByUserId(session.id)
  }
  catch (error: any) {
    logger.error('[Reference API] Error fetching unused references:', error)

    throw parseError(error)
  }
})
