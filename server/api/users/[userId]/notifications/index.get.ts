import { useNotification } from '~~/server/composables/useNotification'

export default defineEventHandler(async (event) => {
  try {
    const { userId } = await defineEventOptions(event, { auth: true, params: ['userId'] })

    const queryRestrict = { user_id: userId }
    const { getNotificationsPaginated } = useNotification(queryRestrict)

    const notifications = await getNotificationsPaginated(getFilter(event))

    setResponseStatus(event, 200)

    return notifications.data
  }
  catch (error: any) {
    throw parseError(error)
  }
})
