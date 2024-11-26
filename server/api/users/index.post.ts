import { useUser } from '@base/server/composables/useUser'
import { sysUserTable } from '@base/server/db/schemas'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  try {
    await defineEventOptions(event, { auth: true })

    const body = await readValidatedBody(
      event,
      createInsertSchema(sysUserTable).extend({
        roles: z.array(z.string()).optional(),
        organizations: z.array(z.string()).optional(),
      }).partial().parse,
    )

    const { createUser } = useUser()

    const response = await createUser(body)

    setResponseStatus(event, 201)

    return response
  }
  catch (error) {
    throw parseError(error)
  }
})
