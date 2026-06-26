import { db } from '@nuxthub/db'
import { organizationTable, projectMemberTable, projectTable } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { createError } from 'h3'
import { defineAuthorizedHandler } from '~~/server/utils/auth'

export default defineAuthorizedHandler(
  ['project:write:self', 'project:manage'],
  async (event, { session }) => {
    const id = getRouterParam(event, 'id')!
    const userId = getRouterParam(event, 'userId')!
    const orgId = session.activeOrg

    console.log(id, userId, orgId)
    const project = await db.query.projectTable.findFirst({
      where: and(eq(projectTable.id, id), eq(projectTable.organization_id, orgId!)),
    })
    if (!project)
      throw createError({ statusCode: 404, statusMessage: 'Project not found' })

    const org = await db.query.organizationTable.findFirst({
      where: eq(organizationTable.id, orgId!),
    })
    if (!org)
      throw createError({ statusCode: 404, statusMessage: 'Organization not found' })

    if (org.owner_id === userId || project.created_by === userId)
      throw createError({ statusCode: 403, statusMessage: 'Cannot remove organization or project owner' })

    if (project.created_by === session.sub)
      throw createError({ statusCode: 403, statusMessage: 'Cannot remove yourself from this project' })

    const [deleted] = await db
      .delete(projectMemberTable)
      .where(and(eq(projectMemberTable.project_id, id), eq(projectMemberTable.user_id, userId)))
      .returning()

    if (!deleted)
      throw createError({ statusCode: 404, statusMessage: 'Member not found in this project' })

    return { success: true }
  },
)
