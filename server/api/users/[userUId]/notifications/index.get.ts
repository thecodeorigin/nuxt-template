import { useNotificationCrud } from '@base/server/composables/useNotificationCrud'

export default defineEventHandler(async (event) => {
  try {
    const { userUId } = await defineEventOptions(event, { auth: true, params: ['userUId'] })

    const queryRestrict = { user_id: userUId }
    const { getNotificationsPaginated } = useNotificationCrud(queryRestrict)

    const notifications = await getNotificationsPaginated(getFilter(event))

    setResponseStatus(event, 200)

    return notifications.data
  }
  catch (error: any) {
    throw parseError(error)
  }
})
