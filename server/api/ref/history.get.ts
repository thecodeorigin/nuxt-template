export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const { getReferenceUsageHistoryByUser } = useReference()

    return getReferenceUsageHistoryByUser(session.id, getFilter(event))
  }
  catch (error: any) {
    logger.error('[Reference API] Error fetching usage history references:', error)

    throw parseError(error)
  }
})
