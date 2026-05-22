import { db } from '@nuxthub/db'
import { todoTable } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { createError, getRouterParam } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import '#layers/todo/server/services/todo'

export default defineAuthorizedHandler(['todo:delete', 'todo:delete:self'], async (event) => {
  const orgId = event.context.activeOrganizationId
  const id = getRouterParam(event, 'id')
  if (!orgId || !id)
    throw createError({ statusCode: 400, statusMessage: 'Bad request' })
  await db
    .delete(todoTable)
    .where(and(eq(todoTable.id, id), eq(todoTable.organization_id, orgId)))
  return { success: true }
})
