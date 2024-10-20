import { useUserCrud } from '@base/server/composables/useUserCrud'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const { getUsersCount } = useUserCrud()

    const response = await getUsersCount()

    setResponseStatus(event, 200)

    return response
  }
  catch (error: any) {
    throw parseError(error)
  }
})
