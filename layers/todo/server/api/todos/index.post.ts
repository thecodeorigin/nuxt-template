import { db } from '@nuxthub/db'
import { todoTable } from '@nuxthub/db/schema'
import { createError, readValidatedBody } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { NewTodoSchema, toTodo } from '#layers/todo/shared/schemas/todo'

export default defineAuthorizedHandler(['todo:write'], async (event, { session }) => {
  const orgId = event.context.activeOrganizationId
  if (!orgId)
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })
  const body = await readValidatedBody(event, NewTodoSchema.parse)
  const [row] = await db
    .insert(todoTable)
    .values({ title: body.title, organization_id: orgId, user_id: session.id })
    .returning()
  return toTodo(row!)
})
