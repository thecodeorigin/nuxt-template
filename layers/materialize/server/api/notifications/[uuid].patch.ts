import { useNotificationCrud } from '@materialize/server/composables/useNotificationCrud'

export default defineEventHandler(async (event) => {
  try {
    const { session, uuid } = await defineEventOptions(event, { auth: true, params: ['uuid'] })

    const queryRestrict = { user_id: session.user!.id! }
    const { updateNotificationById } = useNotificationCrud(queryRestrict)

    const body = await readBody(event)

    if (body && body.read_at) {
      body.read_at = new Date(body.read_at)
    }

    const data = await updateNotificationById(uuid, body)

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
