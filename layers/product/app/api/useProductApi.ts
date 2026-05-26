import type { Product } from '#layers/product/server/db/schema'
import type { CreateProduct, UpdateProduct } from '#layers/product/shared/schemas/product'

export function useProductApi() {
  function fetchProducts(status?: 'active' | 'inactive') {
    return $http<Product[]>('/api/products', { query: status ? { status } : undefined })
  }

  function fetchProduct(id: string) {
    return $http<Product>(`/api/products/${id}`)
  }

  function createProduct(body: CreateProduct) {
    return $http<Product>('/api/products', { method: 'POST', body })
  }

  function updateProduct(id: string, body: UpdateProduct) {
    return $http<Product>(`/api/products/${id}`, { method: 'PATCH', body })
  }

  function deleteProduct(id: string) {
    return $http<{ success: boolean }>(`/api/products/${id}`, { method: 'DELETE' })
  }

  return { fetchProducts, fetchProduct, createProduct, updateProduct, deleteProduct }
}
