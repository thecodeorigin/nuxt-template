import { db } from '@/server/fake-db/pages/profile'

export default defineEventHandler(async event => {
  setResponseStatus(event, 200)

  return db.data.profileHeader
})
