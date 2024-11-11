import { count, ilike, or } from 'drizzle-orm'
import { sysUserTable } from '@base/server/db/schemas'
import type { ParsedFilterQuery } from '@base/server/utils/filter'
import type { LoggedInUser } from '../../next-auth'
import { useCrud } from './useCrud'

export function useUserCrud() {
  const nitroApp = useNitroApp()

  const {
    createRecord,
    updateRecordByKey,
    deleteRecordByKey,
  } = useCrud(sysUserTable)

  async function getUsersCount(options: ParsedFilterQuery) {
    return (
      await db.select({ count: count() }).from(sysUserTable).where(
        or(
          ilike(sysUserTable.full_name, `%${options.keyword}%`),
          ilike(sysUserTable.email, `%${options.keyword}%`),
          ilike(sysUserTable.full_name, `%${options.keywordLower}%`),
          ilike(sysUserTable.email, `%${options.keywordLower}%`),
        ),
      )
    )[0] || { count: 0 }
  }

  async function getUsersPaginated(options: ParsedFilterQuery) {
    const sysUsers = await db.query.sysUserTable.findMany({
      columns: {
        password: false,
      },
      with: {
        role: true,
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

    const { count } = await getUsersCount(options)

    return {
      data: sysUsers,
      total: count,
    }
  }

  async function getUser(type: 'id' | 'email' | 'phone' = 'id', value: string) {
    const sysUser = await db.query.sysUserTable.findFirst({
      columns: {
        password: false,
      },
      with: {
        role: {
          with: {
            permissions: true,
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

  function getUserByPhone(phone: string) {
    return getUser('phone', phone)
  }

  async function updateUserById(id: string, body: any) {
    const { data } = await updateRecordByKey('id', id, body)

    return { data: omit(data, ['password']) }
  }

  async function updateUserByEmail(email: string, body: any) {
    const { data } = await updateRecordByKey('email', email, body)

    return { data: omit(data, ['password']) }
  }

  async function createUser(body: any) {
    const { data } = await createRecord(body)

    nitroApp.hooks.callHook('user:created', data)

    return { data: omit(data, ['password']) as LoggedInUser }
  }

  async function deleteUserById(id: string) {
    const { data } = await deleteRecordByKey('id', id)

    return { data: omit(data, ['password']) }
  }

  return {
    getUsersPaginated,
    getUser,
    getUserById,
    getUserByEmail,
    getUserByPhone,
    createUser,
    updateUserById,
    updateUserByEmail,
    deleteUserById,
    getUsersCount,
  }
}
