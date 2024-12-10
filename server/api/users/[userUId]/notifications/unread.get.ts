import { useNotification } from '@base/server/composables/useNotification'

export default defineEventHandler(async (event) => {
  try {
    const { userUId } = await defineEventOptions(event, { auth: true, params: ['userUId'] })
    const queryRestrict = { user_id: userUId, markAllRead: true }
    const { countNotifications } = useNotification(queryRestrict)
    const notifications = await countNotifications()
    setResponseStatus(event, 200)
    return notifications
  }
  catch (error: any) {
    throw parseError(error)
  }
})
