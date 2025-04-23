import type { CreditHistoryType } from '@base/server/db/schemas'
import { ProductStatus, creditHistoryTable } from '@base/server/db/schemas'
import type { CreditHistory, Product } from '@base/server/types/models'

export function useCredit() {
  function getProducts(): Promise<Product[]> {
    return db.query.productTable.findMany({
      where(schema, { eq }) {
        return eq(schema.status, ProductStatus.ACTIVE)
      },
      orderBy(fields, { asc }) {
        return asc(fields.price)
      },
    })
  }

  async function updateCreditHistory(
    type: CreditHistoryType,
    amount: number,
    userId: string,
  ): Promise<CreditHistory> {
    return (await db.insert(creditHistoryTable)
      .values({
        amount: String(amount),
        type,
        user_id: userId,
      })
      .returning())[0]
  }

  function updateUserCredit(userId: string, credit: number) {
    return useUser()
      .upsertUser(userId, { credit: String(credit) })
  }

  return {
    getProducts,
    updateCreditHistory,
    updateUserCredit,
  }
}
