import { db } from '@nuxthub/db'
import { projectTable } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { createError, readValidatedBody } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { UpdateProjectSchema } from '#layers/project/shared/schemas/project'

export default defineAuthorizedHandler(
  ['project:write:self', 'project:manage'],
  async (event, { session }) => {
    const id = getRouterParam(event, 'id')!
    const orgId = session.activeOrganizationId
    const body = await readValidatedBody(event, UpdateProjectSchema.parse)

    const [updated] = await db
      .update(projectTable)
      .set(body)
      .where(and(eq(projectTable.id, id), eq(projectTable.organization_id, orgId!)))
      .returning()

    if (!updated)
      throw createError({ statusCode: 404, statusMessage: 'Project not found' })

    return updated
  },
)
