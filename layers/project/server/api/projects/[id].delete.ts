import { db } from '@nuxthub/db'
import { projectTable } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { createError } from 'h3'
import { defineAuthorizedHandler } from '~~/server/utils/auth'

export default defineAuthorizedHandler(
  [
    'project:delete',
    'project:delete:self',
    'project:manage',
  ],
  async (event, { session }) => {
    const id = getRouterParam(event, 'id')!
    const orgId = session.activeOrg

    const [deleted] = await db
      .delete(projectTable)
      .where(and(eq(projectTable.id, id), eq(projectTable.organization_id, orgId!)))
      .returning()

    if (!deleted)
      throw createError({ statusCode: 404, statusMessage: 'Project not found' })

    return { success: true }
  },
)
