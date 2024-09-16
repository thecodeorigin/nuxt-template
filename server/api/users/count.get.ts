import { useUserCrud } from '~/server/composables/useUserCrud'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const { countUsers } = useUserCrud()

    const response = await countUsers()

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
