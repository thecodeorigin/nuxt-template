import { db } from '@/server/fake-db/pages/datatable'

export default defineEventHandler(async event => {
  setResponseStatus(event, 200)

  return db.salesDetails
})
