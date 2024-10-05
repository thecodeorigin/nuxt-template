import { eq } from 'drizzle-orm'
import type { ParsedFilterQuery } from '@base/server/utils/filter'
import { userShortcutTable } from '@base/server/db/schemas/user_shortcuts.schema'
import { useCrud } from './useCrud'

export function useShortcutCrud(userId: string) {
  const {
    getRecordsPaginated,
    getRecordByKey,
    createRecord,
    updateRecordByKey,
    deleteRecordByKey,
    countRecords,
  } = useCrud(userShortcutTable, {
    searchBy: ['route'],
    queryRestrict: () => eq(userShortcutTable.user_id, userId),
  })

  async function getShortcutsPaginated(options: ParsedFilterQuery) {
    const { data, total } = await getRecordsPaginated(options)

    return { data, total }
  }

  async function getShortcutById(id: string) {
    const { data } = await getRecordByKey('id', id)

    return { data }
  }

  async function updateShortcutById(id: string, body: any) {
    const { data } = await updateRecordByKey('id', id, body)

    return { data }
  }

  async function createShortcut(body: any) {
    const { data } = await createRecord(body)

    return { data }
  }

  async function deleteShortcutById(id: string) {
    const { data } = await deleteRecordByKey('id', id)

    return { data }
  }

  function countShortcuts() {
    return countRecords()
  }

  return {
    getShortcutsPaginated,
    getShortcutById,
    createShortcut,
    updateShortcutById,
    deleteShortcutById,
    countShortcuts,
  }
}
