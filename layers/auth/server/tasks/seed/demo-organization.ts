import { organizationMemberTable, userTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { DEMO_ORG, DEMO_ORG_GRANTS } from '#layers/auth/server/constants/defaults'
import { ensureOrganization } from '#layers/auth/server/services/organization'

async function upsertMember(
  userEmail: string,
  organization_id: string,
  abilities: readonly string[],
): Promise<boolean> {
  const user = await db.query.userTable.findFirst({
    where: eq(userTable.primary_email, userEmail),
    columns: { id: true },
  })
  if (!user)
    return false
  const abilitiesArr = [...abilities]
  await db.insert(organizationMemberTable)
    .values({ user_id: user.id, organization_id, abilities: abilitiesArr })
    .onConflictDoUpdate({
      target: [organizationMemberTable.user_id, organizationMemberTable.organization_id],
      set: { abilities: abilitiesArr },
    })
  return true
}

export default defineTask({
  meta: {
    name: 'seed:demo-organization',
    description: 'Create the shared "demo" tenant org and grant DEMO_ORG_GRANTS tiers to the dev/demo users. Idempotent.',
  },
  run: async () => {
    const org = await ensureOrganization(DEMO_ORG.slug, DEMO_ORG.name)
    const grants: Array<readonly [string, readonly string[]]> = [
      ['admin@seed.local', DEMO_ORG_GRANTS.admin],
      ['alice@seed.local', DEMO_ORG_GRANTS.member],
      ['bob@seed.local', DEMO_ORG_GRANTS.guest],
      ['admin@demo.local', DEMO_ORG_GRANTS.admin],
      ['user@demo.local', DEMO_ORG_GRANTS.member],
    ]
    const granted: Array<{ email: string, tier: string }> = []
    for (const [email, abilities] of grants) {
      if (await upsertMember(email, org.id, abilities))
        granted.push({ email, tier: tierLabel(abilities) })
    }
    return { result: 'ok', organization_id: org.id, granted }
  },
})

function tierLabel(abilities: readonly string[]): string {
  if (abilities === DEMO_ORG_GRANTS.admin)
    return 'admin'
  if (abilities === DEMO_ORG_GRANTS.member)
    return 'member'
  if (abilities === DEMO_ORG_GRANTS.guest)
    return 'guest'
  return 'custom'
}
