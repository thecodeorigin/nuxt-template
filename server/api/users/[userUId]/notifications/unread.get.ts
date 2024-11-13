import { useNotificationCrud } from '@base/server/composables/useNotificationCrud'

export default defineEventHandler(async (event) => {
  try {
    const { userUId } = await defineEventOptions(event, { auth: true, params: ['userUId'] })
    const queryRestrict = { user_id: userUId, markAllRead: true }
    const { countNotifications } = useNotificationCrud(queryRestrict)
    const notifications = await countNotifications()
    setResponseStatus(event, 200)
    return notifications
  }
  catch (error: any) {
    throw parseError(error)
  }
})
