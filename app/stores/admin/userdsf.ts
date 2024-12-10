import type { InferSelectModel } from 'drizzle-orm'
import type { sysUserTable } from '@base/server/db/schemas'
import type { ParsedFilterQuery } from '@base/server/utils/filter'

export type User = InferSelectModel<typeof sysUserTable>

export const useUserStore = defineStore('user', () => {
  const userList = ref<User[]>([])
  const totalUsers = ref<number>(0)
  const userDetail = ref<User | null>(null)

  async function fetchUserList(options?: ParsedFilterQuery) {
    try {
      const response = await $api('/api/users', {
        method: 'GET',
        query: options,
      })

      userList.value = response.data
      totalUsers.value = response.total
    }
    catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  async function fetchUserDetail(userId: string) {
    try {
      const response = await $api<User>(`/api/users/${userId}`, {
        method: 'GET',
      })

      userDetail.value = response
    }
    catch (error) {
      console.error('Error fetching user detail:', error)
    }
  }

  async function updateUser(userId: string, payload: Partial<User>) {
    try {
      const response = await $api<User>(`/api/users/${userId}`, {
        method: 'PATCH',
        body: payload,
      })

      userDetail.value = response
    }
    catch (error) {
      console.error('Error updating user:', error)
    }
  }

  async function createUser(payload: Partial<User>) {
    try {
      const response = await $api<User>('/api/users', {
        method: 'POST',
        body: payload,
      })

      return response
    }
    catch (error) {
      console.error('Error creating user:', error)
    }
  }

  async function deleteUser(userId: string) {
    try {
      await $api(`/api/users/${userId}`, {
        method: 'DELETE',
      })
    }
    catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  return {
    userList,
    userDetail,
    totalUsers,
    fetchUserList,
    fetchUserDetail,
    updateUser,
    createUser,
    deleteUser,
  }
})
