import type { ParsedFilterQuery } from '@base/server/utils/filter'
import { sysRolePermissionsTable } from '@base/server/db/schemas/sys_roles_permissions.schema'
import { useCrud } from './useCrud'

export function useRolePermissionCrud() {
  const {
    getRecordsPaginated,
  } = useCrud(sysRolePermissionsTable)

  async function getRolePermissions(options: ParsedFilterQuery) {
    const { data, total } = await getRecordsPaginated(options)

    return { data, total }
  }

  return { getRolePermissions }
}
