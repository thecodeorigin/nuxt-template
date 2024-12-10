import type { sysUserTable } from '@base/server/db/schemas/sys_users.schema'
import type { ParsedFilterQuery } from '@base/server/utils/filter'
import type { InferSelectModel } from 'drizzle-orm'
import type { Role } from './role'

export type User = InferSelectModel<typeof sysUserTable>

export type UserWithRoles = User & {
  roles: Array<{
    role: Role
  }>
}

export const useUserStore = defineStore('user', () => {
  async function fetchUsers(options?: Partial<ParsedFilterQuery>) {
    return await $api<{ total: number, data: UserWithRoles[] }>('/users', {
      query: options,
    })
  }

  async function fetchUser(userId: string) {
    return await $api<{ data: UserWithRoles }>(`/users/${userId}`, {
      method: 'GET',
    })
  }

  async function createUser(body: Partial<User> & { roles?: string[], organizations?: string[] }) {
    return await $api<User>('/users', {
      method: 'POST',
      body,
    })
  }

  async function updateUser(userId: string, body: Partial<User> & { roles?: string[], organizations?: string[] }) {
    return await $api(`/users/${userId}`, {
      method: 'PATCH',
      body,
    })
  }

  async function deleteUser(userId: string) {
    return await $api(`/users/${userId}`, {
      method: 'DELETE',
    })
  }

  return {
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
  }
})
