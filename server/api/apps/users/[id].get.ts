import { db } from '@/server/fake-db/apps/users'

export default defineEventHandler(event => {
  const userId = getIntId(event, 'User id is required to get user details')

  const user = db.users.find(u => u.id === userId)

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    })
  }

  return {
    ...user,
    taskDone: 1230,
    projectDone: 568,
    taxId: 'Tax-8894',
    language: 'English',
  }
})
