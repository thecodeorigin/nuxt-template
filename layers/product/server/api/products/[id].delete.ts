import { db } from '@nuxthub/db'
import { productTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { createError } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'

export default defineAuthorizedHandler(['product:delete', 'product:manage'], async (event) => {
  const id = getRouterParam(event, 'id')!
  const [deleted] = await db
    .delete(productTable)
    .where(eq(productTable.id, id))
    .returning()
  if (!deleted)
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  return { success: true }
})
