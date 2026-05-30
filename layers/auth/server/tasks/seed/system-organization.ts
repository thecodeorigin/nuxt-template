import { organizationMemberTable, userTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { SYSTEM_GRANTS, SYSTEM_ORG } from '#layers/auth/server/constants/defaults'
import { ensureOrganization } from '#layers/auth/server/services/organization'

async function upsertSystemAdmin(userEmail: string, organization_id: string): Promise<boolean> {
  const user = await db.query.userTable.findFirst({
    where: eq(userTable.primary_email, userEmail),
    columns: { id: true },
  })
  if (!user)
    return false
  const abilities = [...SYSTEM_GRANTS.admin]
  await db.insert(organizationMemberTable)
    .values({ user_id: user.id, organization_id, abilities })
    .onConflictDoUpdate({
      target: [organizationMemberTable.user_id, organizationMemberTable.organization_id],
      set: { abilities },
    })
  return true
}

export default defineTask({
  meta: {
    name: 'seed:system-organization',
    description: 'Create the reserved "system" org and grant SYSTEM_GRANTS.admin to the dev/demo admin users. Idempotent.',
  },
  run: async () => {
    const org = await ensureOrganization(SYSTEM_ORG.slug, SYSTEM_ORG.name, { is_system: true })
    const admins = ['admin@seed.local', 'admin@demo.local']
    const granted: string[] = []
    for (const email of admins) {
      if (await upsertSystemAdmin(email, org.id))
        granted.push(email)
    }
    return { result: 'ok', organization_id: org.id, granted }
  },
})
