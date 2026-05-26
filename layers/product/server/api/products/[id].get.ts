import { db } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import { createError } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { productTable } from '#layers/product/server/db/schema'

export default defineAuthorizedHandler(['product:write', 'product:manage'], async (event) => {
  const id = getRouterParam(event, 'id')!
  const product = await db.query.productTable.findFirst({ where: eq(productTable.id, id) })
  if (!product)
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  return product
})
