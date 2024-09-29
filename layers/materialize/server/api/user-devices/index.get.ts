import { useUserDeviceCrud } from '@materialize/server/composables/useUserDeviceCrud'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const { getUserDeviceAllTokens } = useUserDeviceCrud({ user_id: session.user.id })

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
