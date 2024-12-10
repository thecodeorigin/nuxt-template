import { useUser } from '@base/server/composables/useUser'
import { sysUserTable } from '@base/server/db/schemas'
import { createInsertSchema } from 'drizzle-zod'

export default defineEventHandler(async (event) => {
  try {
    const { userUId } = await defineEventOptions(event, { auth: true, params: ['userUId'] })

    const body = await readValidatedBody(event, createInsertSchema(sysUserTable).partial().parse)

    const { updateUserById } = useUser()

    return await updateUserById(userUId, body)
  }
  catch (error: any) {
    throw parseError(error)
  }
})
