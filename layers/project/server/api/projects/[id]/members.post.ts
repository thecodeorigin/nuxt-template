import { db } from '@nuxthub/db'
import { projectMemberTable, projectTable } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { createError, readValidatedBody } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { PROJECT_WRITE_SELF_GATE } from '#layers/project/server/constants/gates'
import { AddProjectMemberSchema } from '#layers/project/shared/schemas/project'

export default defineAuthorizedHandler(PROJECT_WRITE_SELF_GATE, async (event, { session }) => {
  const id = getRouterParam(event, 'id')!
  const orgId = session.activeOrganizationId
  const body = await readValidatedBody(event, AddProjectMemberSchema.parse)

  const project = await db.query.projectTable.findFirst({
    where: and(eq(projectTable.id, id), eq(projectTable.organization_id, orgId!)),
  })
  if (!project)
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })

  const [member] = await db
    .insert(projectMemberTable)
    .values({ project_id: id, user_id: body.user_id, role: body.role })
    .onConflictDoUpdate({ target: [projectMemberTable.project_id, projectMemberTable.user_id], set: { role: body.role } })
    .returning()

  return member!
})
