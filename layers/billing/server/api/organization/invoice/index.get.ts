import { db } from '@nuxthub/db'
import { desc, eq } from 'drizzle-orm'
import { createError } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { invoiceTable } from '#layers/billing/server/db/schema'

export default defineAuthorizedHandler(['billing:read', 'billing:manage'], async (_event, { session }) => {
  const orgId = session.activeOrganizationId
  if (!orgId)
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })

  return db
    .select()
    .from(invoiceTable)
    .where(eq(invoiceTable.organization_id, orgId))
    .orderBy(desc(invoiceTable.created_at))
})
