import { db } from '@/server/fake-db/apps/users'

export default defineEventHandler(async event => {
  const user = await readBody(event)

  // Add the data to the database once validated
  db.users.push({
    ...user,
    id: db.users.length + 1,
  })

  setResponseStatus(event, 201)

  return { body: user }
})
