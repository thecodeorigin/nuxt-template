import { db } from '@nuxthub/db'
import { projectMemberTable, projectTable } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { createError } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { PROJECT_WRITE_SELF_GATE } from '#layers/project/server/constants/gates'

export default defineAuthorizedHandler(PROJECT_WRITE_SELF_GATE, async (event, { session }) => {
  const id = getRouterParam(event, 'id')!
  const userId = getRouterParam(event, 'userId')!
  const orgId = session.activeOrganizationId

  const project = await db.query.projectTable.findFirst({
    where: and(eq(projectTable.id, id), eq(projectTable.organization_id, orgId!)),
  })
  if (!project)
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })

  const [deleted] = await db
    .delete(projectMemberTable)
    .where(and(eq(projectMemberTable.project_id, id), eq(projectMemberTable.user_id, userId)))
    .returning()

  if (!deleted)
    throw createError({ statusCode: 404, statusMessage: 'Member not found in this project' })

  return { success: true }
})
