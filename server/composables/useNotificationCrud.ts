import type { SQL } from 'drizzle-orm'
import { and, eq, isNotNull, isNull } from 'drizzle-orm'
import { pick } from 'lodash-es'
import { sysNotificationTable } from '@/server/db/schemas/sys_notifications.schema'
import type { ParsedFilterQuery } from '@/server/utils/filter'
import { useCrud } from '@/server/composables/useCrud'

interface QueryRestrict {
  user_id: string
  markAllRead?: boolean
  markAllUnread?: boolean
}
export function useNotificationCrud(queryRestrict: QueryRestrict) {
  const conditionsMap = [
    { field: 'user_id', condition: eq(sysNotificationTable.user_id, queryRestrict.user_id) },
    { field: 'markAllRead', condition: isNull(sysNotificationTable.read_at) },
    { field: 'markAllUnread', condition: isNotNull(sysNotificationTable.read_at) },
  ]

  const conditionsArray: SQL<unknown>[] = []

  for (const condition of conditionsMap) {
    if (queryRestrict[condition.field as keyof QueryRestrict]) {
      conditionsArray.push(condition.condition)
    }
  }

  const {
    countRecords,
    createRecord,
    deleteRecordByKey,
    getRecordByKey,
    getRecordsPaginated,
    updateRecordByKey,
    updateManyRecords,
  } = useCrud(sysNotificationTable, {
    queryRestrict: () => and(...conditionsArray),
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
