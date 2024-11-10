import { useRolePermissionCrud } from '~~/server/composables/useRolePermissionCrud'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const { getRolePermissions } = useRolePermissionCrud()

    const rolePermissions = await getRolePermissions(getFilter(event))

    return rolePermissions
  }
  catch (error: any) {
    throw parseError(error)
  }
})
