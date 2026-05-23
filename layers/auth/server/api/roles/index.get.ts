import { db } from '@nuxthub/db'
import { roleTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { createError } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'

export default defineAuthorizedHandler(['user:read'], async (_event, { session }) => {
  const orgId = session.activeOrganizationId
  if (!orgId)
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })
  return db.select({
    id: roleTable.id,
    name: roleTable.name,
    description: roleTable.description,
    permissions: roleTable.permissions,
    is_system: roleTable.is_system,
  })
    .from(roleTable)
    .where(eq(roleTable.organization_id, orgId))
})
