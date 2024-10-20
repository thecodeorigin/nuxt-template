import { useNotificationCrud } from '@base/server/composables/useNotificationCrud'

export default defineEventHandler(async (event) => {
  try {
    const { userId } = await defineEventOptions(event, { auth: true, params: ['userId'] })

    const queryRestrict = { user_id: userId, markAllRead: true }
    const { markAllRead } = useNotificationCrud(queryRestrict)
    const response = await markAllRead()

    return response
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})
