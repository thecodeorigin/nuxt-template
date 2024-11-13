import { useNotificationCrud } from '@base/server/composables/useNotificationCrud'

export default defineEventHandler(async (event) => {
  try {
    const { userUId, notificationUId } = await defineEventOptions(event, { auth: true, params: ['userUId', 'notificationUId'] })

    const queryRestrict = { user_id: userUId }
    const { deleteNotificationById } = useNotificationCrud(queryRestrict)

    const data = await deleteNotificationById(notificationUId)

    setResponseStatus(event, 200)

    return data
  }
  catch (error: any) {
    throw parseError(error)
  }
})
