import { db } from '@nuxthub/db'
import { todoTable } from '@nuxthub/db/schema'
import { desc, eq } from 'drizzle-orm'
import { createError } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { toTodo } from '#layers/todo/shared/schemas/todo'

export default defineAuthorizedHandler(['todo:read'], async (event) => {
  const orgId = event.context.activeOrganizationId
  if (!orgId)
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })
  const rows = await db
    .select()
    .from(todoTable)
    .where(eq(todoTable.organization_id, orgId))
    .orderBy(desc(todoTable.created_at))
  return rows.map(toTodo)
})
