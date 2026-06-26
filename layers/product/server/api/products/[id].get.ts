import { db } from '@nuxthub/db'
import { productTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { createError } from 'h3'

export default defineAuthorizedHandler(['product:write', 'product:manage'], async (event) => {
  const id = getRouterParam(event, 'id')!
  const product = await db.query.productTable.findFirst({ where: eq(productTable.id, id) })
  if (!product)
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  return product
})
