import { useNotificationCrud } from '@base/server/composables/useNotificationCrud'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const queryRestrict = { user_id: session.user.id, markAllRead: true }
    const { countNotifications } = useNotificationCrud(queryRestrict)

    const notifications = await countNotifications()

    setResponseStatus(event, 200)

    return notifications
  }
  catch (error: any) {
    throw parseError(error)
  }
})
