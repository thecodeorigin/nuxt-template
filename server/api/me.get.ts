export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const sysUser = await getUserBySession(session)

    setResponseStatus(event, 201)

    return sysUser
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message,
    })
  }
})
