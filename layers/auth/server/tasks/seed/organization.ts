import { organizationMemberTable, userTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { DEMO_ORG } from '#layers/auth/server/constants/defaults'
import { ensureOrganization } from '#layers/auth/server/services/organization'
import { getDefaultRoleAbilities } from '#layers/auth/server/services/permissions-registry'
import { DefaultRole } from '#layers/auth/shared/permissions'

async function upsertMember(
  userEmail: string,
  organization_id: string,
  abilities: string[],
): Promise<boolean> {
  const user = await db.query.userTable.findFirst({
    where: eq(userTable.primary_email, userEmail),
    columns: { id: true },
  })
  if (!user)
    return false
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
    name: 'seed:organization',
    description: 'Create the shared "demo" tenant org and grant default-role abilities to the dev/demo users. Idempotent.',
  },
  run: async () => {
    const org = await ensureOrganization(DEMO_ORG.slug, DEMO_ORG.name)
    const adminAbilities = getDefaultRoleAbilities(DefaultRole.ADMIN)
    const memberAbilities = getDefaultRoleAbilities(DefaultRole.MEMBER)
    const guestAbilities = getDefaultRoleAbilities(DefaultRole.GUEST)
    const grants: Array<readonly [string, string[]]> = [
      ['admin@seed.local', adminAbilities],
      ['alice@seed.local', memberAbilities],
      ['bob@seed.local', guestAbilities],
      ['admin@demo.local', adminAbilities],
      ['user@demo.local', memberAbilities],
    ]
    const granted: Array<{ email: string, tier: string }> = []
    for (const [email, abilities] of grants) {
      if (await upsertMember(email, org.id, abilities))
        granted.push({ email, tier: tierLabel(abilities, adminAbilities, memberAbilities, guestAbilities) })
    }
    return { result: 'ok', organization_id: org.id, granted }
  },
})

function tierLabel(abilities: string[], admin: string[], member: string[], guest: string[]): string {
  if (abilities === admin)
    return 'admin'
  if (abilities === member)
    return 'member'
  if (abilities === guest)
    return 'guest'
  return 'custom'
}
