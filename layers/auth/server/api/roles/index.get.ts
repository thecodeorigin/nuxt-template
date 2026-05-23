import { db } from '@nuxthub/db'
import { roleTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { createError } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'

export default defineAuthorizedHandler(['user:read'], async (_event, { session }) => {
  const orgId = session.activeOrganizationId
  if (!orgId)
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })
  return db.query.roleTable.findMany({
    where: eq(roleTable.organization_id, orgId),
    columns: { id: true, name: true, description: true, permissions: true, is_system: true },
  })
})
