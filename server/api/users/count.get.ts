import { useUser } from '@base/server/composables/useUser'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const { getUserCount } = useUser()

    return await getUserCount()
  }
  catch (error: any) {
    throw parseError(error)
  }
})
