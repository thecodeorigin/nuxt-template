import type { Product } from '@base/server/types/models'
import { ProductStatus, ProductType } from '../db/schemas'

export function useProduct() {
  function getProducts(): Promise<Product[]> {
    return db.query.productTable.findMany({
      where(schema, { eq }) {
        return eq(schema.status, ProductStatus.ACTIVE)
      },
      orderBy(schema, { asc }) {
        return [
          asc(schema.position),
        ]
      },
    })
  }

  function getCreditPackages(): Promise<Product[]> {
    return db.query.productTable.findMany({
      where(schema, { eq, and }) {
        return and(
          eq(schema.type, ProductType.CREDIT),
          eq(schema.status, ProductStatus.ACTIVE),
        )
      },
      orderBy(schema, { asc }) {
        return [
          asc(schema.position),
        ]
      },
    })
  }

  function getProductByProductId(productId: string): Promise<Pick<Product, 'id' | 'price' | 'amount' | 'price_discount'> | undefined> {
    return db.query.productTable.findFirst({
      where(schema, { eq, and }) {
        return and(
          eq(schema.id, productId),
          eq(schema.status, ProductStatus.ACTIVE),
        )
      },
      columns: {
        id: true,
        price: true,
        price_discount: true,
        amount: true,
      },
    })
  }

  return {
    getProducts,
    getCreditPackages,
    getProductByProductId,
  }
}
