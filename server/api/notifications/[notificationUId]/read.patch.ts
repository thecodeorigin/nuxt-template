export default defineEventHandler(async (event) => {
  try {
    const { session, notificationUId } = await defineEventOptions(event, { auth: true, params: ['notificationUId'] })

    const { readNotificationById } = useNotification()

    return readNotificationById(notificationUId, session.sub)
  }
  catch (error: any) {
    logger.error('[Notification API] Error marking notification as read:', error)

    throw parseError(error)
  }
})
