import { usePermission } from '@base/server/composables/usePermission'

export default defineEventHandler(async (event) => {
  try {
    const { permissionUId } = await defineEventOptions(event, { auth: true, params: ['permissionUId'] })

    const { getPermissionById } = usePermission()

    return await getPermissionById(permissionUId)
  }
  catch (error: any) {
    throw parseError(error)
  }
})
