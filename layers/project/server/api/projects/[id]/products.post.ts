import { db } from '@nuxthub/db'
import { projectProductTable, projectTable } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { createError, readValidatedBody } from 'h3'
import { defineAuthorizedHandler } from '~~/server/utils/auth'
import { AddProjectProductSchema } from '#layers/project/shared/schemas/project'

export default defineAuthorizedHandler(
  ['project:write:self', 'project:manage'],
  async (event, { session }) => {
    const id = getRouterParam(event, 'id')!
    const orgId = session.activeOrg
    const body = await readValidatedBody(event, AddProjectProductSchema.parse)

    const project = await db.query.projectTable.findFirst({
      where: and(eq(projectTable.id, id), eq(projectTable.organization_id, orgId!)),
    })
    if (!project)
      throw createError({ statusCode: 404, statusMessage: 'Project not found' })

    const [link] = await db
      .insert(projectProductTable)
      .values({ project_id: id, product_id: body.product_id, quantity: body.quantity })
      .onConflictDoUpdate({ target: [projectProductTable.project_id, projectProductTable.product_id], set: { quantity: body.quantity } })
      .returning()

    return link!
  },
)
