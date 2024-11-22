import { useRole } from '@base/server/composables/useRole'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const { getRoles } = useRole()

    return await getRoles(
      getFilter(event, {
        sortBy: 'name',
        limit: 100,
      }),
    )
  }
  catch (error: any) {
    throw parseError(error)
  }
})
