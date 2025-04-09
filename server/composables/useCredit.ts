import type { CreditHistoryType } from '@base/server/db/schemas'
import { creditHistoryTable } from '@base/server/db/schemas'
import { useUserProfile } from './useUserProfile'

export function useCredit() {
  function getCreditPackages() {
    return db.query.creditPackageTable.findMany({
      orderBy(fields, { asc }) {
        return asc(fields.price)
      },
    })
  }

  function updateCreditHistory(type: CreditHistoryType, amount: number, user_id: string) {
    return db.insert(creditHistoryTable).values({ amount: String(amount), type, user_id })
  }

  function updateUserCredit(userId: string, credit: number) {
    return useUserProfile().upsertUserProfile(userId, { credit: String(credit) })
  }

  return {
    getCreditPackages,
    updateCreditHistory,
    updateUserCredit,
  }
}
