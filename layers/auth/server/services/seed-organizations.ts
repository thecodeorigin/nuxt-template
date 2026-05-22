import { db } from '@nuxthub/db'
import { organizationMemberTable, organizationTable, userTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { DEMO_ORG_GRANTS, SYSTEM_GRANTS } from '#layers/auth/server/services/seed'

async function ensureOrg(slug: string, name: string, flags: { is_system?: boolean } = {}) {
  const [existing] = await db
    .select()
    .from(organizationTable)
    .where(eq(organizationTable.slug, slug))
    .limit(1)
  if (existing)
    return existing
  const [org] = await db
    .insert(organizationTable)
    .values({ slug, name, is_system: !!flags.is_system })
    .returning()
  return org!
}

async function upsertMember(userEmail: string, orgId: string, abilities: readonly string[]) {
  const [user] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.primary_email, userEmail))
    .limit(1)
  if (!user)
    return
  await db
    .insert(organizationMemberTable)
    .values({ user_id: user.id, organization_id: orgId, abilities: [...abilities] })
    .onConflictDoUpdate({
      target: [organizationMemberTable.user_id, organizationMemberTable.organization_id],
      set: { abilities: [...abilities] },
    })
}

/** Reserved platform org. Members here hold platform-wide abilities (user:impersonate). */
export async function seedSystemOrganization(): Promise<string> {
  const org = await ensureOrg('system', 'System', { is_system: true })
  await upsertMember('admin@seed.local', org.id, SYSTEM_GRANTS.admin)
  await upsertMember('admin@demo.local', org.id, SYSTEM_GRANTS.admin)
  return org.id
}

/** Shared tenant org so the admin can manage members + todos in the demo. */
export async function seedDemoOrganization(): Promise<string> {
  const org = await ensureOrg('demo', 'Demo Organization')
  await upsertMember('admin@seed.local', org.id, DEMO_ORG_GRANTS.admin)
  await upsertMember('alice@seed.local', org.id, DEMO_ORG_GRANTS.member)
  await upsertMember('bob@seed.local', org.id, DEMO_ORG_GRANTS.guest)
  await upsertMember('admin@demo.local', org.id, DEMO_ORG_GRANTS.admin)
  await upsertMember('user@demo.local', org.id, DEMO_ORG_GRANTS.member)
  return org.id
}
