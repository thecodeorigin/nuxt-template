import { useUserCrud } from '@base/server/composables/useUserCrud'
import { sysUserTable } from '@base/server/db/schemas'
import { createInsertSchema } from 'drizzle-zod'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const body = await readValidatedBody(event, createInsertSchema(sysUserTable).partial().parse)

    const { createUser } = useUserCrud()

    const response = await createUser(body)

    setResponseStatus(event, 201)

    return response
  }
  catch (error) {
    console.log('««««« Error »»»»»', error)
    throw parseError(error)
  }
})
