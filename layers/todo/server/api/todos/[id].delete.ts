import { db } from '@nuxthub/db'
import { todoTable } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { createError, getRouterParam } from 'h3'
import { defineAuthorizedHandler, defineSubject } from '#layers/auth/server/services/casl'

// Register the todo subject in the same module scope so the registry is
// populated before the first request is evaluated (avoids Nitro dev-mode
// lazy-loading ordering issues with side-effect-only imports).
defineSubject('todo', {
  ownerKey: 'user_id',
  fetch: async (id, event) => {
    const orgId = event.context.activeOrganizationId
    if (!orgId)
      return null
    const [row] = await db
      .select()
      .from(todoTable)
      .where(and(eq(todoTable.id, id), eq(todoTable.organization_id, orgId)))
      .limit(1)
    return row ?? null
  },
})

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
