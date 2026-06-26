import { db } from '@nuxthub/db'
import { selfhostAuditTable } from '@nuxthub/db/schema'
import { desc, eq } from 'drizzle-orm'

const DEFAULT_LIMIT = 50

export default defineAdminHandler(['selfhost:read', 'selfhost:manage'], async (_event, { session }) => {
  const orgId = session.activeOrg!
  const rows = await db.query.selfhostAuditTable.findMany({
    where: eq(selfhostAuditTable.organization_id, orgId),
    orderBy: [desc(selfhostAuditTable.started_at)],
    limit: DEFAULT_LIMIT,
  })
  return { audits: rows }
})
