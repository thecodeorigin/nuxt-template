import { db } from '@nuxthub/db'
import { desc, eq } from 'drizzle-orm'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { selfhostAuditTable } from '#layers/selfhost/server/db/schema'

const DEFAULT_LIMIT = 50

export default defineAuthorizedHandler(['selfhost:read', 'selfhost:manage'], async (_event, { session }) => {
  const orgId = session.activeOrganizationId!
  const rows = await db.query.selfhostAuditTable.findMany({
    where: eq(selfhostAuditTable.organization_id, orgId),
    orderBy: [desc(selfhostAuditTable.started_at)],
    limit: DEFAULT_LIMIT,
  })
  return { audits: rows }
})
