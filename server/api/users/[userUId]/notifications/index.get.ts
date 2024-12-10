import { useNotification } from '@base/server/composables/useNotification'

export default defineEventHandler(async (event) => {
  try {
    const { userUId } = await defineEventOptions(event, { auth: true, params: ['userUId'] })

    const queryRestrict = { user_id: userUId }
    const { getNotificationsPaginated } = useNotification(queryRestrict)

    const notifications = await getNotificationsPaginated(getFilter(event))

    setResponseStatus(event, 200)

    return notifications.data
  }
  catch (error: any) {
    throw parseError(error)
  }
})
