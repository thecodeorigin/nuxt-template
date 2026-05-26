import { db } from '@nuxthub/db'
import { userTable } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { createError } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { projectMemberTable, projectProductTable, projectTable } from '#layers/project/server/db/schema'

export default defineAuthorizedHandler(['project:read', 'project:write', 'project:manage'], async (event, { session }) => {
  const id = getRouterParam(event, 'id')!
  const orgId = session.activeOrganizationId

  const project = await db.query.projectTable.findFirst({
    where: and(eq(projectTable.id, id), eq(projectTable.organization_id, orgId!)),
  })
  if (!project)
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })

  const [members, products] = await Promise.all([
    db.select({
      user_id: projectMemberTable.user_id,
      role: projectMemberTable.role,
      added_at: projectMemberTable.added_at,
      name: userTable.name,
      username: userTable.username,
      avatar: userTable.avatar,
    })
      .from(projectMemberTable)
      .leftJoin(userTable, eq(projectMemberTable.user_id, userTable.id))
      .where(eq(projectMemberTable.project_id, id)),
    db.select().from(projectProductTable).where(eq(projectProductTable.project_id, id)),
  ])

  return { ...project, members, products }
})
