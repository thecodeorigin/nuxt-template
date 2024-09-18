import type { SQL } from 'drizzle-orm'
import { and, eq } from 'drizzle-orm'
import { userDeviceTable } from '../db/schemas/user_devices.schema'
import { useCrud } from './useCrud'

interface QueryRestrict {
  user_id: string
}
export function useUserDeviceCrud(queryRestrict: QueryRestrict) {
  const conditionsMap = [
    { field: 'user_id', condition: eq(userDeviceTable.user_id, queryRestrict.user_id) },
  ]
  const conditionsArray = [] as SQL<unknown>[]

  for (const condition of conditionsMap) {
    if (queryRestrict[condition.field as keyof QueryRestrict]) {
      conditionsArray.push(condition.condition)
    }
  }
  const { getRecordsPaginated, getRecordByKey, createRecord, deleteRecordByKey } = useCrud(userDeviceTable, {
    queryRestrict: () => and(
      ...conditionsArray,
    ),
  })
  async function getUserDeviceAllTokens(options: ParsedFilterQuery) {
    const { data, total } = await getRecordsPaginated(options)
    return { data, total }
  }
  async function getUserDeviceToken(token_device: string) {
    const { data } = await getRecordByKey('token_device', token_device)
    return { data }
  }

  async function createUserDeviceToken(body: any) {
    const { data } = await createRecord(body)
    return { data }
  }
  async function deleteUserDeviceToken(token_device: string) {
    const { data } = await deleteRecordByKey('token_device', token_device)
    return { data }
  }

  return {
    getUserDeviceToken,
    createUserDeviceToken,
    deleteUserDeviceToken,
    getUserDeviceAllTokens,
  }
}
