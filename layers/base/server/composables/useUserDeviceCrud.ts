import { and, eq } from 'drizzle-orm'
import { userDeviceTable } from '@base/server/db/schemas/user_devices.schema'
import { useCrud } from './useCrud'

interface QueryRestrict {
  user_id: string | any
}
export function useUserDeviceCrud(queryRestrict: QueryRestrict) {
  const { getRecordsPaginated, getRecordByKey, createRecord, deleteRecordByKey } = useCrud(userDeviceTable, {
    queryRestrict: () => and(
      ...[queryRestrict.user_id && eq(userDeviceTable.user_id, queryRestrict.user_id)].filter(Boolean),
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
