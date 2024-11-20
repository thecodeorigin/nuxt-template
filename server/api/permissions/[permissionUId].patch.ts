import { usePermission } from '@base/server/composables/usePermission'

export default defineEventHandler(async (event) => {
  try {
    const { permissionUId } = await defineEventOptions(event, { auth: true, params: ['permissionUId'] })

    const body = await readBody(event)

    const { updatePermissionById } = usePermission()

    return await updatePermissionById(permissionUId, body)
  }
  catch (error: any) {
    throw parseError(error)
  }
})
