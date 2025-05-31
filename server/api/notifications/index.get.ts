export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const { getNotificationsPaginated } = useNotification()

    return getNotificationsPaginated(session.id, getFilter(event))
  }
  catch (error: any) {
    logger.error('[Notification API] Error fetching notifications:', error)

    throw parseError(error)
  }
})
