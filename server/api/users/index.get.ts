import { useUser } from '@base/server/composables/useUser'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const { getUsers } = useUser()

    return await getUsers(
      getFilter(event, { sortBy: 'created_at' }),
    )
  }
  catch (error: any) {
    throw parseError(error)
  }
})
