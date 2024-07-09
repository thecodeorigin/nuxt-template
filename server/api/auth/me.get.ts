import { db } from '@/server/fake-db/auth'

export default defineEventHandler(async event => {
  const session = await setAuthOnlyRoute(event, 'You must be signed in to get your data.')

  const dbUser = db.users.find(user => user.email === session.user?.email)

  if (!dbUser) {
    throw createError({
      statusCode: 403,
      statusMessage: `User with email "${session.user?.email}" not found in records.`,
    })
  }

  // ℹ️ Don't send password in response
  const { password: _, ...response } = dbUser

  return response
})
