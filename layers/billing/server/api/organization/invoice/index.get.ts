import { db } from '@nuxthub/db'
import { invoiceTable } from '@nuxthub/db/schema'
import { desc, eq } from 'drizzle-orm'
import { createError } from 'h3'

export default defineAuthorizedHandler(['billing:read', 'billing:manage'], async (_event, { session }) => {
  const orgId = session.activeOrg
  if (!orgId)
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })

  return db
    .select()
    .from(invoiceTable)
    .where(eq(invoiceTable.organization_id, orgId))
    .orderBy(desc(invoiceTable.created_at))
})
