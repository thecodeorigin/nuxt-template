export default defineEventHandler(async (_event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  return await runTask('seed:users')
})
