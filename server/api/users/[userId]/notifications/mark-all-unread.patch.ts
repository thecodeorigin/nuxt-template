import { useNotificationCrud } from '@base/server/composables/useNotificationCrud'

export default defineEventHandler(async (event) => {
  try {
    const { userId } = await defineEventOptions(event, { auth: true, params: ['userId'] })

    const queryRestrict = { user_id: userId, markAllUnread: true }
    const { markAllUnread } = useNotificationCrud(queryRestrict)
    const response = await markAllUnread()

    return response
  }
  catch (error: any) {
    throw parseError(error)
  }
})
