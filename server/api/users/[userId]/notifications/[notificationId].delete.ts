import { useNotificationCrud } from '@base/server/composables/useNotificationCrud'

export default defineEventHandler(async (event) => {
  try {
    const { userId, notificationId } = await defineEventOptions(event, { auth: true, params: ['userId', 'notificationId'] })

    const queryRestrict = { user_id: userId }
    const { deleteNotificationById } = useNotificationCrud(queryRestrict)

    const data = await deleteNotificationById(notificationId)

    setResponseStatus(event, 200)

    return data
  }
  catch (error: any) {
    throw parseError(error)
  }
})
