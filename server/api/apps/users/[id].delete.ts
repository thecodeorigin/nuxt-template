import { db } from '@/server/fake-db/apps/users'

export default defineEventHandler(event => {
  const userId = getIntId(event, 'User id is required to delete a user')

  // Find the index of the user in the database
  const userIndex = db.users.findIndex(user => user.id === userId)

  // Remove user from the database
  db.users.splice(userIndex, 1)

  setResponseStatus(event, 204)

  return null
})
