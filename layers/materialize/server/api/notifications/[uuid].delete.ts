import { useNotificationCrud } from '@materialize/server/composables/useNotificationCrud'

export default defineEventHandler(async (event) => {
  try {
    const { session, uuid } = await defineEventOptions(event, { auth: true, params: ['uuid'] })

    const queryRestrict = { user_id: session.user!.id! }
    const { deleteNotificationById } = useNotificationCrud(queryRestrict)

    const data = await deleteNotificationById(uuid)

    setResponseStatus(event, 200)

    return data
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})
