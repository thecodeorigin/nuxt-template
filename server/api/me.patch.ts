import { useUser } from '@base/server/composables/useUser'
import { createInsertSchema } from 'drizzle-zod'
import { sysUserTable } from '../db/schemas'

export default defineEventHandler(async (event) => {
  try {
    const { session } = await defineEventOptions(event, { auth: true })

    const body = await readValidatedBody(event, createInsertSchema(sysUserTable).partial().parse)

    return tryWithCache(
      getStorageSessionKey(session.user.providerAccountId),
      async () => {
        const { updateUserByEmail } = useUser()

        const sysUser = await updateUserByEmail(session.user!.email, body)

        setResponseStatus(event, 201)

        return sysUser
      },
    )
  }
  catch (error: any) {
    throw parseError(error)
  }
})
