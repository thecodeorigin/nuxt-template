import { useUserCrud } from '@base/server/composables/useUserCrud'

export default defineEventHandler(async (event) => {
  try {
    const { userId } = await defineEventOptions(event, { auth: true, params: ['userId'] })

    const { getUserById } = useUserCrud()

    const response = await getUserById(userId)

    setResponseStatus(event, 200)

    return response.data
  }
  catch (error: any) {
    throw parseError(error)
  }
})
