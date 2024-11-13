import { useNotificationCrud } from '@base/server/composables/useNotificationCrud'

export default defineEventHandler(async (event) => {
  try {
    const { userUId } = await defineEventOptions(event, { auth: true, params: ['userUId'] })

    const queryRestrict = { user_id: userUId, markAllRead: true }
    const { markAllRead } = useNotificationCrud(queryRestrict)
    const response = await markAllRead()

    return response
  }
  catch (error: any) {
    throw parseError(error)
  }
})
