import { db } from '@nuxthub/db'
import { readValidatedBody } from 'h3'
import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { productTable } from '#layers/product/server/db/schema'
import { CreateProductSchema } from '#layers/product/shared/schemas/product'

export default defineAuthorizedHandler(['product:write', 'product:manage'], async (event) => {
  const body = await readValidatedBody(event, CreateProductSchema.parse)
  const [product] = await db.insert(productTable).values(body).returning()
  return product!
})
