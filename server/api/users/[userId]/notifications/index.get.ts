import { useNotificationCrud } from '@base/server/composables/useNotificationCrud'

export default defineEventHandler(async (event) => {
  try {
    const { userId } = await defineEventOptions(event, { auth: true, params: ['userId'] })

    const queryRestrict = { user_id: userId }
    const { getNotificationsPaginated } = useNotificationCrud(queryRestrict)

    const notifications = await getNotificationsPaginated(getFilter(event))

    setResponseStatus(event, 200)

    return notifications.data
  }
  catch (error: any) {
    throw parseError(error)
  }
})
