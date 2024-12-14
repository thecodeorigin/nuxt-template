import { useNotification } from '~~/server/composables/useNotification'

export default defineEventHandler(async (event) => {
  try {
    const { userId, notificationUId } = await defineEventOptions(event, { auth: true, params: ['userId', 'notificationUId'] })

    const queryRestrict = { user_id: userId }
    const { deleteNotificationById } = useNotification(queryRestrict)

    const data = await deleteNotificationById(notificationUId)

    setResponseStatus(event, 200)

    return data
  }
  catch (error: any) {
    throw parseError(error)
  }
})
