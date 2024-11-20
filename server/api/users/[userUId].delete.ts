import { useUser } from '@base/server/composables/useUser'

export default defineEventHandler(async (event) => {
  try {
    const { userUId } = await defineEventOptions(event, { auth: true, params: ['userUId'] })

    const { deleteUserById } = useUser()

    return await deleteUserById(userUId)
  }
  catch (error: any) {
    throw parseError(error)
  }
})
