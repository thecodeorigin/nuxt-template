import { db } from '@nuxthub/db'
import { projectTable } from '@nuxthub/db/schema'
import { and, desc, eq } from 'drizzle-orm'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'

export default defineAuthorizedHandler(['project:read', 'project:write', 'project:manage'], async (_event, { session }) => {
  const orgId = session.activeOrganizationId
  if (!orgId)
    return []

  const rows = await db
    .select()
    .from(projectTable)
    .where(and(eq(projectTable.organization_id, orgId), eq(projectTable.status, 'active')))
    .orderBy(desc(projectTable.created_at))

  return rows
})
