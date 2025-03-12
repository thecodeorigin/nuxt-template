import { useUserDevice } from '@base/server/composables/useUserDevice'

export default defineEventHandler(async (event) => {
  try {
    const { userId } = await defineEventOptions(event, { auth: true, params: ['userId'] })

    const { getUserDeviceAllTokens } = useUserDevice({ user_id: userId })

    const tokens = await getUserDeviceAllTokens({} as ParsedFilterQuery)

    return tokens
  }
  catch (error: any) {
    throw parseError(error)
  }
})
