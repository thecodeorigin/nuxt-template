import { db } from '@nuxthub/db'
import { notificationTable } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { createError, getRouterParam } from 'h3'
import { toNotification } from '#layers/notification/shared/schemas/notification'

export default defineAuthenticatedHandler(async (event, session) => {
  const orgId = event.context.activeOrganizationId
  const id = getRouterParam(event, 'id')
  if (!orgId || !id)
    throw createError({ statusCode: 400, statusMessage: 'Bad request' })
  const [updated] = await db.update(notificationTable)
    .set({ is_read: true })
    .where(and(
      eq(notificationTable.id, id),
      eq(notificationTable.user_id, session.sub),
      eq(notificationTable.organization_id, orgId),
    ))
    .returning()
  if (!updated)
    throw createError({ statusCode: 404, statusMessage: 'Notification not found' })
  return toNotification(updated)
})
