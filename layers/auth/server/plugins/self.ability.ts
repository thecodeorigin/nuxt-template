import { db } from '@nuxthub/db'
import { userTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { defineSubject } from '#layers/auth/server/services/casl'

export default defineNitroPlugin(() => {
  defineSubject('user', {
    paramName: 'userId',
    fetch: async (id) => {
      const user = await db.query.userTable.findFirst({
        where: eq(userTable.id, id),
        columns: { id: true },
      })
      return user ? { user_id: user.id } : null
    },
  })
})
