export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const { getNotificationsPaginated } = useNotification()

    const result = await getNotificationsPaginated(session.id, getFilter(event))
    return result.data
  }
  catch (error: any) {
    logger.error('[Notification API] Error fetching notifications:', error)

    throw parseError(error)
  }
})
