import { useNotification } from '@base/server/composables/useNotification'

export default defineEventHandler(async (event) => {
  try {
    const { session, notificationUId } = await defineEventOptions(event, { auth: true, params: ['notificationUId'] })

    const { unreadNotificationById } = useNotification()

    return unreadNotificationById(notificationUId, session.sub)
  }
  catch (error: any) {
    throw parseError(error)
  }
})
