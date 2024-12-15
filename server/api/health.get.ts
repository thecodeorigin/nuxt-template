export default defineEventHandler(async () => {
  try {
    return { success: true }
  }
  catch (error: any) {
    throw createError({
      statusCode: 503,
      statusMessage: error.message,
    })
  }
})
