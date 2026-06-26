import { db } from '@nuxthub/db'
import { productTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { createError, readValidatedBody } from 'h3'
import { defineAuthorizedHandler } from '~~/server/utils/auth'
import { UpdateProductSchema } from '#layers/product/shared/schemas/product'

export default defineAuthorizedHandler(['product:write', 'product:manage'], async (event) => {
  const id = getRouterParam(event, 'id')!
  const body = await readValidatedBody(event, UpdateProductSchema.parse)
  const [updated] = await db
    .update(productTable)
    .set(body)
    .where(eq(productTable.id, id))
    .returning()
  if (!updated)
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  return updated
})
