import { useNotification } from '@base/server/composables/useNotification'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const { markAllUnread } = useNotification()

    return markAllUnread(session.sub)
  }
  catch (error: any) {
    logger.error('[Notification API] Error marking all notifications as unread:', error)

    throw parseError(error)
  }
})
