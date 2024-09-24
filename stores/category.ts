import type { InferSelectModel } from 'drizzle-orm'
import type { categoryTable } from '@/server/db/schemas/category.schema.js'

type Category = InferSelectModel<typeof categoryTable>

export const useCategoryStore = defineStore('category', () => {
  async function fetchCategories(query: { page: number, limit: number, keyword: string }) {
    return $api<{ total: number, data: Category[] }>('/categories', {
      query,
    })
  }

  function createCategory(payload: Pick<Category, 'name' | 'slug' | 'description' | 'image_url' | 'parent_id'>) {
    return $api<Category[]>('/categories', {
      method: 'POST',
      body: payload,
    })
  }

  function fetchCategory(id: string) {
    return $api<Category>(`/categories/${id}`)
  }

  function updateCategory(id: string, payload: Pick<Category, 'name' | 'slug' | 'description' | 'image_url' | 'parent_id'>) {
    return $api<Category>(`/categories/${id}`, {
      method: 'PATCH',
      body: payload,
    })
  }

  function deleteCategory(id: string) {
    return $api<Category>(`/categories/${id}`, {
      method: 'DELETE',
    })
  }

  return {
    fetchCategories,
    createCategory,
    fetchCategory,
    updateCategory,
    deleteCategory,
  }
})
