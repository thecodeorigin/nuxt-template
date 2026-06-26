import { db } from '@nuxthub/db'
import { notificationTable } from '@nuxthub/db/schema'
import { and, desc, eq } from 'drizzle-orm'
import { getValidatedQuery } from 'h3'
import { NotificationQuerySchema, toNotification } from '#layers/notification/shared/schemas/notification'

export default defineAuthenticatedHandler(async (event, session) => {
  const orgId = event.context.activeOrganizationId
  if (!orgId)
    return { items: [], hasMore: false }
  const { offset, limit } = await getValidatedQuery(event, NotificationQuerySchema.parse)
  const rows = await db
    .select()
    .from(notificationTable)
    .where(and(eq(notificationTable.user_id, session.sub), eq(notificationTable.organization_id, orgId)))
    .orderBy(desc(notificationTable.created_at))
    .limit(limit + 1)
    .offset(offset)
  const hasMore = rows.length > limit
  return { items: rows.slice(0, limit).map(toNotification), hasMore }
})
