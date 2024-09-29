import { useNotificationCrud } from '@materialize/server/composables/useNotificationCrud'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const queryRestrict = { user_id: session.user!.id!, markAllUnread: true }
    const { markAllUnread } = useNotificationCrud(queryRestrict)
    const response = await markAllUnread()

    return response
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})
