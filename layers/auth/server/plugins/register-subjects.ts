import { db } from '@nuxthub/db'
import { projectTable, userTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { defineSubject } from '#layers/auth/server/services/casl'

export default defineNitroPlugin(() => {
  defineSubject('user', {
    paramName: 'userId',
    ownerKey: 'id',
    fetch: async (id) => {
      const user = await db.query.userTable.findFirst({
        where: eq(userTable.id, id),
        columns: { id: true },
      })
      return user ?? null
    },
  })
  defineSubject('project', {
    paramName: 'projectId',
    ownerKey: 'id',
    fetch: async (id) => {
      const project = await db.query.projectTable.findFirst({
        where: eq(projectTable.id, id),
        columns: { id: true },
      })
      return project ?? null
    },
  })
})
