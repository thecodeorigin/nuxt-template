import { usePermission } from '@base/server/composables/usePermission'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const { getPermissions } = usePermission()

    return await getPermissions(
      getFilter(event, {
        sortBy: 'action',
        limit: 100,
      }),
    )
  }
  catch (error: any) {
    throw parseError(error)
  }
})
