import type { CreditHistoryType } from '@base/server/db/schemas'
import { creditHistoryTable } from '@base/server/db/schemas'
import type { CreditHistory, CreditPackage } from '@base/server/types/models'

export function useCredit() {
  function getCreditPackages(): Promise<CreditPackage[]> {
    return db.query.creditPackageTable.findMany({
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
    getCreditPackages,
    updateCreditHistory,
    updateUserCredit,
  }
}
