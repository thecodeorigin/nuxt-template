import type { creditPackageTable } from '@base/server/db/schemas'
import type { InferSelectModel } from 'drizzle-orm'

export type CreditPackage = InferSelectModel<typeof creditPackageTable>

export function useApiCreditPackage() {
  function fetchCreditPackages() {
    return $api<{ data: CreditPackage[] }>('/api/credit-packages')
  }

  return {
    fetchCreditPackages,
  }
}
