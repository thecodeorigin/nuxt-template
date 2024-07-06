import { db } from '@/server/fake-db/pages/profile'

export default defineEventHandler(async event => {
  const { tab = '' } = getQuery(event)

  setResponseStatus(event, 200)

  return db.data[tab as keyof typeof db.data]
})
