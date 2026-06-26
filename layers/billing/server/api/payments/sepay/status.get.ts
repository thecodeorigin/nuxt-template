import { db } from '@nuxthub/db'
import { transactionTable } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { createError, getValidatedQuery } from 'h3'
import { z } from 'zod'

export default defineAuthenticatedHandler(async (event, session) => {
  const { id } = await getValidatedQuery(event, z.object({ id: z.string() }).parse)
  const orgId = session.activeOrg
  if (!orgId)
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })
  const tx = await db.query.transactionTable.findFirst({
    where: and(eq(transactionTable.id, id), eq(transactionTable.organization_id, orgId)),
    columns: { id: true, status: true },
  })
  if (!tx)
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  return tx
})
