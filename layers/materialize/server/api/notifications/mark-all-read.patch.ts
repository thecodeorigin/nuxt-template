import { useNotificationCrud } from '@materialize/server/composables/useNotificationCrud'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const queryRestrict = { user_id: session.user!.id!, markAllRead: true }
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
