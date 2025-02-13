import { asc } from 'drizzle-orm'
import { creditPackageTable } from '@base/server/db/schemas'

export default defineEventHandler(async (event) => {
  try {
    const data = await db.select().from(creditPackageTable).orderBy(asc(creditPackageTable.price))

    setResponseStatus(event, 200)
    return data
  }
  catch (error) {
    return parseError(error)
  }
})
