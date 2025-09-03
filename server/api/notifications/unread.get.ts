export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const { getNotificationsPaginated } = useNotification()

    return getNotificationsPaginated(session.id, getFilter(event), true)
  }
  catch (error: any) {
    console.error('[Notification API] Error fetching unread notifications:', error)

    throw parseError(error)
  }
})
