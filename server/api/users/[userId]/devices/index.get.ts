import { useUserDeviceCrud } from '@base/server/composables/useUserDeviceCrud'

export default defineEventHandler(async (event) => {
  try {
    const { userId } = await defineEventOptions(event, { auth: true, params: ['userId'] })

    const { getUserDeviceAllTokens } = useUserDeviceCrud({ user_id: userId })

    const tokens = await getUserDeviceAllTokens({} as ParsedFilterQuery)
    setResponseStatus(event, 200)
    return tokens
  }
  catch (error: any) {
    throw createError(
      {
        statusCode: 500,
        statusMessage: error.message,
      },
    )
  }
})
