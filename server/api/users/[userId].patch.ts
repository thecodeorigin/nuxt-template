import { useUserCrud } from '@base/server/composables/useUserCrud'

export default defineEventHandler(async (event) => {
  try {
    const { userId } = await defineEventOptions(event, { auth: true, params: ['userId'] })

    const body = await readBody(event)

    const { updateUserById } = useUserCrud()

    const response = await updateUserById(userId, body)

    setResponseStatus(event, 201)

    return response
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})
