export default defineEventHandler(async () => {
  try {
    await db.query.sysFaqTable.findFirst({ columns: { id: true } })

    return { success: true }
  }
  catch (error: any) {
    console.error(error)

    throw createError({
      statusCode: 503,
      statusMessage: error.message,
    })
  }
})
