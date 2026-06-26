import { db } from '@nuxthub/db'
import { projectProductTable, projectTable } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { createError } from 'h3'
import { defineAuthorizedHandler } from '~~/server/utils/auth'

export default defineAuthorizedHandler(
  ['project:write:self', 'project:manage'],
  async (event, { session }) => {
    const id = getRouterParam(event, 'id')!
    const productId = getRouterParam(event, 'productId')!
    const orgId = session.activeOrg

    const project = await db.query.projectTable.findFirst({
      where: and(eq(projectTable.id, id), eq(projectTable.organization_id, orgId!)),
    })
    if (!project)
      throw createError({ statusCode: 404, statusMessage: 'Project not found' })

    const [deleted] = await db
      .delete(projectProductTable)
      .where(and(eq(projectProductTable.project_id, id), eq(projectProductTable.product_id, productId)))
      .returning()

    if (!deleted)
      throw createError({ statusCode: 404, statusMessage: 'Product not linked to this project' })

    return { success: true }
  },
)
