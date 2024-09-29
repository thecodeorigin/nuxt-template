import { useNotificationCrud } from '@materialize/server/composables/useNotificationCrud'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const queryRestrict = { user_id: session.user!.id! }
    const { getNotificationsPaginated } = useNotificationCrud(queryRestrict)

    const notifications = await getNotificationsPaginated(getFilter(event))

    setResponseStatus(event, 200)

    return notifications.data
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})
