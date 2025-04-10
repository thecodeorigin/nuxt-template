import { useNotification } from '@base/server/composables/useNotification'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const { getNotificationsPaginated } = useNotification()

    return getNotificationsPaginated(session.sub, getFilter(event), true)
  }
  catch (error: any) {
    logger.error('[Notification API] Error fetching unread notifications:', error)

    throw parseError(error)
  }
})
