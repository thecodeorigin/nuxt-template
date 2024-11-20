import { usePermission } from '@base/server/composables/usePermission'

export default defineEventHandler(async (event) => {
  try {
    const { permissionUId } = await defineEventOptions(event, { auth: true, params: ['permissionUId'] })

    const { deletePermissionById } = usePermission()

    return await deletePermissionById(permissionUId)
  }
  catch (error: any) {
    throw parseError(error)
  }
})
