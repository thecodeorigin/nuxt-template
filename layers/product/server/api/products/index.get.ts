import { db } from '@nuxthub/db'
import { desc, eq } from 'drizzle-orm'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { productTable } from '#layers/product/server/db/schema'

export default defineAuthorizedHandler(['product:write', 'product:manage'], async (event) => {
  const { status } = getQuery(event)
  const rows = await db
    .select()
    .from(productTable)
    .where(status === 'inactive' ? eq(productTable.status, 'inactive') : eq(productTable.status, 'active'))
    .orderBy(desc(productTable.created_at))
  return rows
})
