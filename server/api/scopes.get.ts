export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    return await getUserScopes()
  }
  catch (error: any) {
    logger.error('[Scopes API] Error fetching scopes:', error)

    throw parseError(error)
  }
})
