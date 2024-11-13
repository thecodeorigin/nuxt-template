import { useUserCrud } from '@base/server/composables/useUserCrud'

export default defineEventHandler(async (event) => {
  try {
    const { userUId } = await defineEventOptions(event, { auth: true, params: ['userUId'] })

    const { getUserById } = useUserCrud()

    const response = await getUserById(userUId)

    setResponseStatus(event, 200)

    return response.data
  }
  catch (error: any) {
    throw parseError(error)
  }
})
