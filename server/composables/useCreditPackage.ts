import type { CreditPackage } from '@base/server/types/models'
import { eq } from 'drizzle-orm'
import { creditPackageTable } from '@base/server/db/schemas'

export function useCreditPackage() {
  function getCreditPackages(): Promise<CreditPackage[]> {
    return db.query.creditPackageTable.findMany({
      orderBy(schema, { asc }) {
        return [
          asc(schema.position),
        ]
      },
    })
  }

  function getCreditPackageByProductId(productId: string): Promise<Pick<CreditPackage, 'id' | 'price' | 'amount'> | undefined> {
    return db.query.creditPackageTable.findFirst({
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
    getCreditPackages,
    getCreditPackageByProductId,
  }
}
