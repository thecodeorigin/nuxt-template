import { useNotificationCrud } from '@base/server/composables/useNotificationCrud'

export default defineEventHandler(async (event) => {
  try {
    const { userUId } = await defineEventOptions(event, { auth: true, params: ['userUId'] })

    const queryRestrict = { user_id: userUId, markAllUnread: true }
    const { markAllUnread } = useNotificationCrud(queryRestrict)
    const response = await markAllUnread()

    return response
  }
  catch (error: any) {
    throw parseError(error)
  }
})
