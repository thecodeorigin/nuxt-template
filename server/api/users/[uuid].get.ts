import { useUserCrud } from '@base/server/composables/useUserCrud'

export default defineEventHandler(async (event) => {
  try {
    const { uuid } = await defineEventOptions(event, { auth: true, params: ['uuid'] })

    const { getUserById } = useUserCrud()

    const response = await getUserById(uuid)

    setResponseStatus(event, 200)

    return response
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }
})
