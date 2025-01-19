import { createInsertSchema } from 'drizzle-zod'
import { sysNotificationTable } from '@base/server/db/schemas'
import { useNotification } from '@base/server/composables/useNotification'

export default defineEventHandler(async (event) => {
  try {
    const { userId, notificationUId } = await defineEventOptions(event, { auth: true, params: ['userId', 'notificationUId'] })

    const queryRestrict = { user_id: userId }
    const { updateNotificationById } = useNotification(queryRestrict)

    const body = await readBody(event)

    if (body && body.read_at) {
      body.read_at = new Date()
    }

    const data = await updateNotificationById(notificationUId, body)

    setResponseStatus(event, 200)

    return data
  }
  catch (error: any) {
    throw parseError(error)
  }
})
