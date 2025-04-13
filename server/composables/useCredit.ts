import type { CreditHistoryType } from '@base/server/db/schemas'
import { creditHistoryTable } from '@base/server/db/schemas'

export function useCredit() {
  function getCreditPackages() {
    return db.query.creditPackageTable.findMany({
      orderBy(fields, { asc }) {
        return asc(fields.price)
      },
    })
  }

  function updateCreditHistory(type: CreditHistoryType, amount: number, userId: string) {
    return db.insert(creditHistoryTable)
      .values({ amount: String(amount), type, user_id: userId })
  }

  function updateUserCredit(userId: string, credit: number) {
    return useUserProfile()
      .upsertUserProfile(userId, { credit: String(credit) })
  }

  return {
    getCreditPackages,
    updateCreditHistory,
    updateUserCredit,
  }
}
