import { usePermission } from '@base/server/composables/usePermission'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const { getPermissionCount } = usePermission()

    return await getPermissionCount(getFilter(event))
  }
  catch (error: any) {
    throw parseError(error)
  }
})
