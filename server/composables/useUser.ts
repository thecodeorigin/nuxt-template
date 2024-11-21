import type { ParsedFilterQuery } from '@base/server/utils/filter'
import type { LoggedInUser } from '../../next-auth'
import { sysUserTable } from '@base/server/db/schemas'
import { count, eq, ilike, or } from 'drizzle-orm'

export function useUser() {
  const nitroApp = useNitroApp()

  async function getUserCount(options?: ParsedFilterQuery) {
    const data = await db.select({ total: count() }).from(sysUserTable).where(
      or(
        ilike(sysUserTable.full_name, `%${options?.keyword || ''}%`),
        ilike(sysUserTable.email, `%${options?.keyword || ''}%`),
        ilike(sysUserTable.full_name, `%${options?.keywordLower || ''}%`),
        ilike(sysUserTable.email, `%${options?.keywordLower || ''}%`),
      ),
    )

    return data[0]
  }

  async function getUsers(options: ParsedFilterQuery) {
    const sysUsers = await db.query.sysUserTable.findMany({
      columns: {
        password: false,
      },
      with: {
        roles: {
          with: {
            role: true,
          },
        },
      },
      limit: options.limit,
      offset: options.limit * (options.page - 1),
      orderBy(schema, { asc, desc }) {
        return options.sortAsc
          ? asc((schema as any)[options.sortBy])
          : desc((schema as any)[options.sortBy])
      },
      where(schema, { or, ilike }) {
        if (options.keyword && options.keywordLower) {
          return or(
            ilike(schema.full_name, `%${options.keyword}%`),
            ilike(schema.email, `%${options.keyword}%`),
            ilike(schema.full_name, `%${options.keywordLower}%`),
            ilike(schema.email, `%${options.keywordLower}%`),
          )
        }
      },
    })

    const { total } = options.withCount
      ? await getUserCount(options)
      : { total: sysUsers.length }

    return {
      data: sysUsers,
      total,
    }
  }

  async function getUser(type: 'id' | 'email' | 'phone' = 'id', value: string) {
    const sysUser = await db.query.sysUserTable.findFirst({
      columns: {
        password: false,
      },
      with: {
        roles: {
          with: {
            role: {
              with: {
                permissions: true,
              },
            },
          },
        },
        organizations: {
          with: {
            organization: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      where(schema, { eq }) {
        switch (type) {
          case 'id':
            return eq(schema.id, value)
          case 'email':
            return eq(schema.email, value)
          case 'phone':
            return eq(schema.phone, value)
        }
      },
    })

    return { data: sysUser as LoggedInUser | undefined }
  }

  function getUserById(id: string) {
    return getUser('id', id)
  }

  function getUserByEmail(email: string) {
    return getUser('email', email)
  }

  async function updateUser(type: 'id' | 'email', value: string, body: any) {
    await db.update(sysUserTable).set(body).where(
      eq(sysUserTable[type], value),
    )
  }

  async function updateUserById(id: string, body: any) {
    await updateUser('id', id, body)
  }

  async function updateUserByEmail(email: string, body: any) {
    await updateUser('email', email, body)
  }

  async function createUser(body: any) {
    const _data = await db.insert(sysUserTable).values(body).returning()

    nitroApp.hooks.callHook('user:created', _data[0])

    return { data: omit(_data[0], ['password']) as LoggedInUser }
  }

  async function deleteUserById(id: string) {
    await db.delete(sysUserTable).where(eq(sysUserTable.id, id))
  }

  return {
    getUsers,
    getUser,
    getUserById,
    getUserByEmail,
    createUser,
    updateUserById,
    updateUserByEmail,
    deleteUserById,
    getUserCount,
  }
}
