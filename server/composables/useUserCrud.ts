import { useCrud } from './useCrud'
import type { ParsedFilterQuery } from '~/server/utils/filter'
import { sysUserTable } from '~/server/db/schemas/sys_users.schema'

export function useUserCrud() {
  const {
    getRecordsPaginated,
    getRecordByKey,
    createRecord,
    updateRecordByKey,
    deleteRecordByKey,
    countRecords,
  } = useCrud(sysUserTable, {
    searchBy: ['full_name', 'email'],
  })

  async function getUsersPaginated(options: ParsedFilterQuery) {
    const { data, total } = await getRecordsPaginated(options)

    return { data: data.map(u => omit(u, ['password'])), total }
  }

  async function getUserById(id: string) {
    const { data } = await getRecordByKey('id', id)

    return { data: omit(data, ['password']) }
  }

  async function getUserByEmail(email: string) {
    const { data } = await getRecordByKey('email', email)

    return { data: omit(data, ['password']) }
  }

  async function getUserByPhone(phone: string) {
    const { data } = await getRecordByKey('phone', phone)

    return { data: omit(data, ['password']) }
  }

  async function updateUserById(id: string, body: any) {
    const { data } = await updateRecordByKey('id', id, body)

    return { data: omit(data, ['password']) }
  }

  async function createUser(body: any) {
    const { data } = await createRecord(body)

    await createStripeCustomerOnSignup(body.email)

    return { data: omit(data, ['password']) }
  }

  async function deleteUserById(id: string) {
    const { data } = await deleteRecordByKey('id', id)

    return { data: omit(data, ['password']) }
  }

  function countUsers() {
    return countRecords()
  }

  return {
    getUsersPaginated,
    getUserById,
    getUserByEmail,
    getUserByPhone,
    createUser,
    updateUserById,
    deleteUserById,
    countUsers,
  }
}
