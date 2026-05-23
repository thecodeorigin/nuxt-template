import { db } from '@nuxthub/db'
import { transactionTable } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { createError, getValidatedQuery } from 'h3'
import { z } from 'zod'
import { defineAuthenticatedHandler } from '#layers/auth/server/services/auth'

export default defineAuthenticatedHandler(async (event, session) => {
  const { id } = await getValidatedQuery(event, z.object({ id: z.string() }).parse)
  const orgId = session.activeOrganizationId
  if (!orgId)
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })
  const [tx] = await db.select({ id: transactionTable.id, status: transactionTable.status })
    .from(transactionTable)
    .where(and(eq(transactionTable.id, id), eq(transactionTable.organization_id, orgId)))
    .limit(1)
  if (!tx)
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  return tx
})
