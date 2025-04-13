export default defineEventHandler(async (event) => {
  try {
    const { session, notificationUId } = await defineEventOptions(event, { auth: true, params: ['notificationUId'] })

    const { deleteNotificationById } = useNotification()

    return deleteNotificationById(notificationUId, session.sub)
  }
  catch (error: any) {
    logger.error('[Notification API] Error deleting notification:', error)

    throw parseError(error)
  }
})
