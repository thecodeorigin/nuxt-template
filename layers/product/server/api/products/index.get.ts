import { db } from '@nuxthub/db'
import { productTable } from '@nuxthub/db/schema'
import { desc, eq } from 'drizzle-orm'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'

export default defineAuthorizedHandler(['product:write', 'product:manage'], async (event) => {
  const { status } = getQuery(event)
  const rows = await db
    .select()
    .from(productTable)
    .where(status === 'inactive' ? eq(productTable.status, 'inactive') : eq(productTable.status, 'active'))
    .orderBy(desc(productTable.created_at))
  return rows
})
