export default defineEventHandler(async (event) => {
  try {
    const { session, notificationUId } = await defineEventOptions(event, { auth: true, params: ['notificationUId'] })

    const { unreadNotificationById } = useNotification()

    return unreadNotificationById(notificationUId, session.id)
  }
  catch (error: any) {
    logger.error('[Notification API] Error marking notification as unread:', error)

    throw parseError(error)
  }
})
