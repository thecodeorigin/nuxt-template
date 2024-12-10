import { useUserDevice } from '@base/server/composables/useUserDevice'

export default defineEventHandler(async (event) => {
  try {
    const { userUId } = await defineEventOptions(event, { auth: true, params: ['userUId'] })

    const { getUserDeviceAllTokens } = useUserDevice({ user_id: userUId })

    const tokens = await getUserDeviceAllTokens({} as ParsedFilterQuery)
    setResponseStatus(event, 200)
    return tokens
  }
  catch (error: any) {
    throw parseError(error)
  }
})
