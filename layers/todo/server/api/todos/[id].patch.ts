import { db } from '@nuxthub/db'
import { todoTable } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { createError, getRouterParam, readValidatedBody } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { toTodo, UpdateTodoSchema } from '#layers/todo/shared/schemas/todo'

export default defineAuthorizedHandler(['todo:write'], async (event) => {
  const orgId = event.context.activeOrganizationId
  const id = getRouterParam(event, 'id')
  if (!orgId || !id)
    throw createError({ statusCode: 400, statusMessage: 'Bad request' })
  const body = await readValidatedBody(event, UpdateTodoSchema.parse)
  const [updated] = await db
    .update(todoTable)
    .set(body)
    .where(and(eq(todoTable.id, id), eq(todoTable.organization_id, orgId)))
    .returning()
  if (!updated)
    throw createError({ statusCode: 404, statusMessage: 'Todo not found' })
  return toTodo(updated)
})
