import type { Tables } from '@/server/types/supabase'

type Category = Tables<'categories'>

export const useCategoryStore = defineStore('category', () => {
  async function fetchCategories(query: { page: number, limit: number, keyword: string }) {
    return $api<Category[]>('/categories', {
      query,
    })
  }

  function createCategory(payload: Pick<Category, 'name' | 'slug' | 'description' | 'image_url'>) {
    return $api<Category[]>('/categories', {
      method: 'POST',
      body: payload,
    })
  }

  function fetchCategory(id: string) {
    return $api<Category>(`/categories/${id}`)
  }

  function updateCategory(id: string, payload: Pick<Category, 'name' | 'slug' | 'description' | 'image_url'>) {
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
