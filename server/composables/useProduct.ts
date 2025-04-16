import type { Product } from '@base/server/types/models'
import { ProductType } from '../db/schemas'

export function useProduct() {
  function getProducts(): Promise<Product[]> {
    return db.query.productTable.findMany({
      orderBy(schema, { asc }) {
        return [
          asc(schema.position),
        ]
      },
    })
  }

  function getCreditPackages(): Promise<Product[]> {
    return db.query.productTable.findMany({
      where(schema, { eq }) {
        return eq(schema.type, ProductType.CREDIT)
      },
      orderBy(schema, { asc }) {
        return [
          asc(schema.position),
        ]
      },
    })
  }

  function getProductByProductId(productId: string): Promise<Pick<Product, 'id' | 'price' | 'amount'> | undefined> {
    return db.query.productTable.findFirst({
      where(schema, { eq }) {
        return eq(schema.id, productId)
      },
      columns: {
        id: true,
        price: true,
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
