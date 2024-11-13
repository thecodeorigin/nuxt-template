import { useUserCrud } from '@base/server/composables/useUserCrud'
import { sysUserTable } from '@base/server/db/schemas'
import { createInsertSchema } from 'drizzle-zod'

export default defineEventHandler(async (event) => {
  try {
    const { userId } = await defineEventOptions(event, { auth: true, params: ['userId'] })

    const body = await readValidatedBody(event, createInsertSchema(sysUserTable).partial().parse)

    const { updateUserById } = useUserCrud()

    const response = await updateUserById(userId, body)

    setResponseStatus(event, 201)

    return response
  }
  catch (error: any) {
    throw parseError(error)
  }
})
