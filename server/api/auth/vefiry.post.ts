import { createVerify } from 'node:crypto'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)

    if (!query.token) {
      throw createError({
        statusCode: 401,
        statusMessage: ErrorMessage.DONOT_HAVE_PERMISSION,
      })
    }

    const runtimeConfig = useRuntimeConfig()
    const isValid = createVerify('HS256').verify(runtimeConfig.auth.secret, query.token as string)
  }
  catch (error: any) {
    throw parseError(error)
  }
})
