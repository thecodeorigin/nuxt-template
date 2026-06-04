import { db } from '@nuxthub/db'
import { projectMemberTable } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { defineSubject } from '#layers/auth/server/services/casl'

export default defineNitroPlugin(() => {
  defineSubject('project', {
    paramName: 'id',
    fetch: async (id) => {
      const owner = await db.query.projectMemberTable.findFirst({
        where: and(eq(projectMemberTable.project_id, id), eq(projectMemberTable.role, 'owner')),
        columns: { user_id: true },
      })
      if (!owner)
        return null
      return { id, user_id: owner.user_id }
    },
  })
})
