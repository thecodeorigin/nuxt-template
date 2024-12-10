import { useNotification } from '@base/server/composables/useNotification'

export default defineEventHandler(async (event) => {
  try {
    const { userUId, notificationUId } = await defineEventOptions(event, { auth: true, params: ['userUId', 'notificationUId'] })

    const queryRestrict = { user_id: userUId }
    const { deleteNotificationById } = useNotification(queryRestrict)

    const data = await deleteNotificationById(notificationUId)

    setResponseStatus(event, 200)

    return data
  }
  catch (error: any) {
    throw parseError(error)
  }
})
