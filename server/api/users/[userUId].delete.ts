import { useUserCrud } from '@base/server/composables/useUserCrud'

export default defineEventHandler(async (event) => {
  try {
    const { userUId } = await defineEventOptions(event, { auth: true, params: ['userUId'] })

    const { deleteUserById } = useUserCrud()

    const response = await deleteUserById(userUId)

    setResponseStatus(event, 201)

    return response
  }
  catch (error: any) {
    throw parseError(error)
  }
})
