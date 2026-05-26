import { db } from '@nuxthub/db'
import { desc, eq } from 'drizzle-orm'
import { createError } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { transactionTable } from '#layers/billing/server/db/schema'

export default defineAuthorizedHandler(['billing:read'], async (event, { session }) => {
  const orgId = session.activeOrganizationId
  if (!orgId)
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })

  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 20))
  const offset = (page - 1) * limit

  const rows = await db
    .select()
    .from(transactionTable)
    .where(eq(transactionTable.organization_id, orgId))
    .orderBy(desc(transactionTable.created_at))
    .limit(limit)
    .offset(offset)

  return { items: rows, page, limit }
})
