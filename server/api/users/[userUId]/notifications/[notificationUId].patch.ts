import { useNotification } from '@base/server/composables/useNotification'
import { createInsertSchema } from 'drizzle-zod'
import { sysNotificationTable } from '@base/server/db/schemas'

export default defineEventHandler(async (event) => {
  try {
    const { userUId, notificationUId } = await defineEventOptions(event, { auth: true, params: ['userUId', 'notificationUId'] })

    const queryRestrict = { user_id: userUId }
    const { updateNotificationById } = useNotification(queryRestrict)

    const body = await readValidatedBody(event, createInsertSchema(sysNotificationTable).partial().parse)

    if (body && body.read_at) {
      body.read_at = new Date(body.read_at)
    }

    const data = await updateNotificationById(notificationUId, body)

    setResponseStatus(event, 200)

    return data
  }
  catch (error: any) {
    throw parseError(error)
  }
})
