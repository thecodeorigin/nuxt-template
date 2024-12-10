import { useUser } from '@base/server/composables/useUser'

export default defineEventHandler(async (event) => {
  try {
    const { userUId } = await defineEventOptions(event, { auth: true, params: ['userUId'] })

    const { getUserById } = useUser()

    return await getUserById(userUId)
  }
  catch (error: any) {
    throw parseError(error)
  }
})
