import { db } from '@nuxthub/db'
import { organizationMemberTable, organizationTable, userTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'
import { DEMO_ORG, DEMO_ORG_GRANTS, SYSTEM_GRANTS, SYSTEM_ORG } from '#layers/auth/server/constants/defaults'

async function ensureOrg(slug: string, name: string, flags: { is_system?: boolean } = {}) {
  const [existing] = await db.select().from(organizationTable).where(eq(organizationTable.slug, slug)).limit(1)
  if (existing)
    return existing
  const [org] = await db.insert(organizationTable).values({ slug, name, is_system: !!flags.is_system }).returning()
  return org!
}

async function upsertMember(userEmail: string, orgId: string, abilities: readonly string[]) {
  const [user] = await db.select().from(userTable).where(eq(userTable.primary_email, userEmail)).limit(1)
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

export async function seedSystemOrganization(): Promise<string> {
  const org = await ensureOrg(SYSTEM_ORG.slug, SYSTEM_ORG.name, { is_system: true })
  await upsertMember('admin@seed.local', org.id, SYSTEM_GRANTS.admin)
  await upsertMember('admin@demo.local', org.id, SYSTEM_GRANTS.admin)
  return org.id
}

export async function seedDemoOrganization(): Promise<string> {
  const org = await ensureOrg(DEMO_ORG.slug, DEMO_ORG.name)
  await upsertMember('admin@seed.local', org.id, DEMO_ORG_GRANTS.admin)
  await upsertMember('alice@seed.local', org.id, DEMO_ORG_GRANTS.member)
  await upsertMember('bob@seed.local', org.id, DEMO_ORG_GRANTS.guest)
  await upsertMember('admin@demo.local', org.id, DEMO_ORG_GRANTS.admin)
  await upsertMember('user@demo.local', org.id, DEMO_ORG_GRANTS.member)
  return org.id
}

export default defineTask({
  meta: { name: 'seed:organizations', description: 'Seed the system + demo organizations and memberships.' },
  run: async () => {
    const systemOrgId = await seedSystemOrganization()
    const demoOrgId = await seedDemoOrganization()
    return { result: { systemOrgId, demoOrgId } }
  },
})
