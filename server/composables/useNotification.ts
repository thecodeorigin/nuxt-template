import { and, eq, isNotNull, isNull } from 'drizzle-orm'
import { sysNotificationTable } from '@base/server/db/schemas'
import { useCrud } from '@base/server/composables/useCrud'
import type { ParsedFilterQuery } from '@base/server/utils/filter'

interface QueryRestrict {
  user_id: string
  markAllRead?: any
  markAllUnread?: any
}
export function useNotification(queryRestrict: QueryRestrict) {
  const {
    countRecords,
    createRecord,
    deleteRecordByKey,
    getRecordByKey,
    getRecordsPaginated,
    updateRecordByKey,
    updateManyRecords,
  } = useCrud(sysNotificationTable, {
    queryRestrict: () => and(...[
      queryRestrict.user_id && eq(sysNotificationTable.user_id, queryRestrict.user_id),
      queryRestrict.markAllRead && isNull(sysNotificationTable.read_at),
      queryRestrict.markAllUnread && isNotNull(sysNotificationTable.read_at),
    ].filter(Boolean)),
  })
  async function getNotificationsPaginated(options: ParsedFilterQuery) {
    const { data, total } = await getRecordsPaginated(options)
    return { data, total }
  }
  async function getNotificationById(id: string) {
    const { data } = await getRecordByKey('id', id)
    return { data }
  }
  async function updateNotificationById(id: string, body: any) {
    const { data } = await updateRecordByKey('id', id, body)
    return { data }
  }
  async function createNotification(body: any) {
    const { data } = await createRecord(body)
    return { data }
  }
  async function deleteNotificationById(id: string) {
    const { data } = await deleteRecordByKey('id', id)
    return { data }
  }
  function countNotifications() {
    return countRecords()
  }
  function markAllRead() {
    return updateManyRecords({ read_at: new Date() })
  }
  function markAllUnread() {
    return updateManyRecords({ read_at: null })
  }
  return {
    getNotificationsPaginated,
    getNotificationById,
    createNotification,
    updateNotificationById,
    deleteNotificationById,
    countNotifications,
    markAllRead,
    markAllUnread,
  }
}
