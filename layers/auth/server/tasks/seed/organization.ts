import { organizationMemberTable, userTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { DEMO_ORG } from '#layers/auth/server/constants/defaults'
import { ensureOrganization } from '#layers/auth/server/services/organization'
import { DEFAULT_ROLE_ABILITIES, DefaultRole } from '#layers/auth/shared/permissions'

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
    name: 'seed:organization',
    description: 'Create the shared "demo" tenant org and grant DEFAULT_ROLE_ABILITIES tiers to the dev/demo users. Idempotent.',
  },
  run: async () => {
    const org = await ensureOrganization(DEMO_ORG.slug, DEMO_ORG.name)
    const grants: Array<readonly [string, readonly string[]]> = [
      ['admin@seed.local', DEFAULT_ROLE_ABILITIES[DefaultRole.ADMIN]],
      ['alice@seed.local', DEFAULT_ROLE_ABILITIES[DefaultRole.MEMBER]],
      ['bob@seed.local', DEFAULT_ROLE_ABILITIES[DefaultRole.GUEST]],
      ['admin@demo.local', DEFAULT_ROLE_ABILITIES[DefaultRole.ADMIN]],
      ['user@demo.local', DEFAULT_ROLE_ABILITIES[DefaultRole.MEMBER]],
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
  if (abilities === DEFAULT_ROLE_ABILITIES[DefaultRole.ADMIN])
    return 'admin'
  if (abilities === DEFAULT_ROLE_ABILITIES[DefaultRole.MEMBER])
    return 'member'
  if (abilities === DEFAULT_ROLE_ABILITIES[DefaultRole.GUEST])
    return 'guest'
  return 'custom'
}
