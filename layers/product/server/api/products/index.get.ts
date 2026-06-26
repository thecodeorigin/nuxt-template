import { db } from '@nuxthub/db'
import { productTable } from '@nuxthub/db/schema'
import { desc, eq } from 'drizzle-orm'

export default defineAuthorizedHandler(['product:write', 'product:manage'], async (event) => {
  const { status } = getQuery(event)
  const rows = await db
    .select()
    .from(productTable)
    .where(status === 'inactive' ? eq(productTable.status, 'inactive') : eq(productTable.status, 'active'))
    .orderBy(desc(productTable.created_at))
  return rows
})
