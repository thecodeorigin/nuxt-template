import { db } from '@nuxthub/db'
import { organizationTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { createError, readValidatedBody } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { UpdateOrganizationSchema } from '#layers/auth/shared/schemas/organization'

export default defineAuthorizedHandler(['user:manage'], async (event) => {
  const orgId = event.context.activeOrganizationId
  if (!orgId)
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })
  const body = await readValidatedBody(event, UpdateOrganizationSchema.parse)
  const [org] = await db
    .select()
    .from(organizationTable)
    .where(eq(organizationTable.id, orgId))
    .limit(1)
  if (!org)
    throw createError({ statusCode: 404, statusMessage: 'Organization not found' })
  if (org.is_system)
    throw createError({ statusCode: 403, statusMessage: 'The system organization cannot be renamed' })
  const [updated] = await db
    .update(organizationTable)
    .set({ name: body.name })
    .where(eq(organizationTable.id, orgId))
    .returning()
  return { id: updated!.id, name: updated!.name }
})
