import { db } from '@nuxthub/db'
import { todoTable } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { defineSubject } from '#layers/auth/server/services/casl'

defineSubject('todo', {
  ownerKey: 'user_id',
  fetch: async (id, event) => {
    const orgId = event.context.activeOrganizationId
    if (!orgId)
      return null
    const [row] = await db
      .select()
      .from(todoTable)
      .where(and(eq(todoTable.id, id), eq(todoTable.organization_id, orgId)))
      .limit(1)
    return row ?? null
  },
})
