import { useUserCrud } from '@base/server/composables/useUserCrud'
import { sysUserTable } from '@base/server/db/schemas'
import { createInsertSchema } from 'drizzle-zod'

export default defineEventHandler(async (event) => {
  try {
    const { userUId } = await defineEventOptions(event, { auth: true, params: ['userUId'] })

    const body = await readValidatedBody(event, createInsertSchema(sysUserTable).partial().parse)

    const { updateUserById } = useUserCrud()

    const response = await updateUserById(userUId, body)

    setResponseStatus(event, 201)

    return response
  }
  catch (error: any) {
    throw parseError(error)
  }
})
