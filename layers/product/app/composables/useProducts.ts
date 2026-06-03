import type { Product } from '@nuxthub/db/schema'
import type { InjectionKey } from 'vue'

export interface ProductsContext {
  products: Ref<Product[]>
  fetchProducts: () => Promise<void>
  createProduct: (body: import('#layers/product/shared/schemas/product').CreateProduct) => Promise<Product>
  updateProduct: (id: string, body: import('#layers/product/shared/schemas/product').UpdateProduct) => Promise<Product>
  deleteProduct: (id: string) => Promise<void>
}

export const productsKey: InjectionKey<ProductsContext> = Symbol('products')

export function useProducts(): ProductsContext {
  const ctx = inject(productsKey)
  if (!ctx)
    throw new Error('useProducts() must be called inside a component that provides productsKey')
  return ctx
}
