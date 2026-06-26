import { db } from '@nuxthub/db'
import { projectMemberTable, projectTable } from '@nuxthub/db/schema'
import { createError, readValidatedBody } from 'h3'
import { defineAuthorizedHandler } from '~~/server/utils/auth'
import { CreateProjectSchema } from '#layers/project/shared/schemas/project'

export default defineAuthorizedHandler(
  ['project:write', 'project:manage'],
  async (event, { session }) => {
    const orgId = session.activeOrg
    if (!orgId)
      throw createError({ statusCode: 400, statusMessage: 'No active organization' })

    const body = await readValidatedBody(event, CreateProjectSchema.parse)

    const [project] = await db.insert(projectTable).values({
      ...body,
      organization_id: orgId,
      created_by: session.sub,
    }).returning()

    await db.insert(projectMemberTable).values({
      project_id: project!.id,
      user_id: session.sub,
      role: 'owner',
    })

    return project!
  },
)
