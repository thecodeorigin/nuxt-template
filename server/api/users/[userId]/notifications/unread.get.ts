import { useNotificationCrud } from '@base/server/composables/useNotificationCrud'

export default defineEventHandler(async (event) => {
  try {
    const { userId } = await defineEventOptions(event, { auth: true, params: ['userId'] })
    const queryRestrict = { user_id: userId, markAllRead: true }
    const { countNotifications } = useNotificationCrud(queryRestrict)
    const notifications = await countNotifications()
    setResponseStatus(event, 200)
    return notifications
  }
  catch (error: any) {
    throw parseError(error)
  }
})
