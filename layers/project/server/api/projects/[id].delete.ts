import { db } from '@nuxthub/db'
import { projectTable } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { createError } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'

export default defineAuthorizedHandler(['project:write', 'project:manage'], async (event, { session }) => {
  const id = getRouterParam(event, 'id')!
  const orgId = session.activeOrganizationId

  const [deleted] = await db
    .delete(projectTable)
    .where(and(eq(projectTable.id, id), eq(projectTable.organization_id, orgId!)))
    .returning()

  if (!deleted)
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })

  return { success: true }
})
