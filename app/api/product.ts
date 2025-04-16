import type { productTable } from '@base/server/db/schemas'
import type { InferSelectModel } from 'drizzle-orm'

export type Product = InferSelectModel<typeof productTable>

export function useApiProduct() {
  function fetchProducts() {
    return $api<{ data: Product[] }>('/api/products')
  }

  function fetchCreditPackages() {
    return $api<{ data: Product[] }>('/api/products/credit-packages')
  }

  return {
    fetchProducts,
    fetchCreditPackages,
  }
}
