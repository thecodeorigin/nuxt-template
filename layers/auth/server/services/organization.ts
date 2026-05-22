import { db } from '@nuxthub/db'
import { organizationMemberTable, organizationTable, userTable } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { simplifyNanoId } from '~~/shared/utils/id'
import { DEFAULT_PERSONAL_ORG_ABILITIES, mergeOrgAbilities } from '#layers/auth/shared/permissions'

type UserRow = typeof userTable.$inferSelect

export async function getSystemOrganizationId(): Promise<string | null> {
  const [org] = await db
    .select({ id: organizationTable.id })
    .from(organizationTable)
    .where(eq(organizationTable.is_system, true))
    .limit(1)
  return org?.id ?? null
}

async function membershipAbilities(userId: string, orgId: string): Promise<string[]> {
  const [m] = await db
    .select({ abilities: organizationMemberTable.abilities })
    .from(organizationMemberTable)
    .where(and(eq(organizationMemberTable.user_id, userId), eq(organizationMemberTable.organization_id, orgId)))
    .limit(1)
  return m?.abilities ?? []
}

/** Effective = system grants ∪ active-org grants, each filtered to its org kind. */
export async function loadEffectiveAbilities(userId: string, activeOrgId: string | null): Promise<string[]> {
  const systemOrgId = await getSystemOrganizationId()
  const systemGrants = systemOrgId ? await membershipAbilities(userId, systemOrgId) : []
  if (!activeOrgId)
    return mergeOrgAbilities(systemGrants, [], false)
  const activeGrants = await membershipAbilities(userId, activeOrgId)
  const activeIsSystem = activeOrgId === systemOrgId
  return mergeOrgAbilities(systemGrants, activeGrants, activeIsSystem)
}

/** Default active org: personal → first NON-system tenant org → null. */
export async function defaultActiveOrganizationId(userId: string): Promise<string | null> {
  const rows = await db.select({ org: organizationTable.id, personal: organizationTable.is_personal, system: organizationTable.is_system })
    .from(organizationMemberTable)
    .innerJoin(organizationTable, eq(organizationTable.id, organizationMemberTable.organization_id))
    .where(eq(organizationMemberTable.user_id, userId))
  const tenant = rows.filter(r => !r.system)
  return (tenant.find(r => r.personal)?.org) ?? tenant[0]?.org ?? null
}

/** Get-or-create an org by slug (used by the seeder and the demo-login backdoor). */
export async function ensureOrganization(slug: string, name: string, flags: { is_system?: boolean } = {}) {
  const [existing] = await db.select().from(organizationTable).where(eq(organizationTable.slug, slug)).limit(1)
  if (existing)
    return existing
  const [org] = await db.insert(organizationTable).values({ slug, name, is_system: !!flags.is_system }).returning()
  return org!
}

/** Create a membership only if absent — preserves grants on returning users. */
export async function ensureMembership(userId: string, orgId: string, abilities: readonly string[]) {
  await db.insert(organizationMemberTable)
    .values({ user_id: userId, organization_id: orgId, abilities: [...abilities] })
    .onConflictDoNothing()
}

export async function isMember(userId: string, orgId: string): Promise<boolean> {
  const [m] = await db
    .select({ id: organizationMemberTable.id })
    .from(organizationMemberTable)
    .where(and(eq(organizationMemberTable.user_id, userId), eq(organizationMemberTable.organization_id, orgId)))
    .limit(1)
  return !!m
}

/** Tenant orgs only (system org is not a switchable workspace). */
export async function getUserOrganizations(userId: string) {
  return db.select({ id: organizationTable.id, name: organizationTable.name, slug: organizationTable.slug, is_personal: organizationTable.is_personal })
    .from(organizationMemberTable)
    .innerJoin(organizationTable, eq(organizationTable.id, organizationMemberTable.organization_id))
    .where(and(eq(organizationMemberTable.user_id, userId), eq(organizationTable.is_system, false)))
}

export async function getOrgMembers(orgId: string) {
  return db.select({
    id: userTable.id,
    name: userTable.name,
    username: userTable.username,
    primary_email: userTable.primary_email,
    avatar: userTable.avatar,
    abilities: organizationMemberTable.abilities,
    is_suspended: userTable.is_suspended,
  })
    .from(organizationMemberTable)
    .innerJoin(userTable, eq(userTable.id, organizationMemberTable.user_id))
    .where(eq(organizationMemberTable.organization_id, orgId))
}

export async function countOrgManagers(orgId: string): Promise<number> {
  const rows = await db
    .select({ abilities: organizationMemberTable.abilities })
    .from(organizationMemberTable)
    .where(eq(organizationMemberTable.organization_id, orgId))
  return rows.filter(r => (r.abilities ?? []).includes('user:manage')).length
}

export async function uniqueSlug(base: string): Promise<string> {
  const root = base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'org'
  for (let i = 0; i < 5; i++) {
    const candidate = i === 0 ? root : `${root}-${simplifyNanoId().slice(0, 6)}`
    const [hit] = await db.select({ id: organizationTable.id }).from(organizationTable).where(eq(organizationTable.slug, candidate)).limit(1)
    if (!hit)
      return candidate
  }
  return `${root}-${simplifyNanoId()}`
}

/** Idempotent personal org: org (is_personal) + owner membership (admin grants). */
export async function createPersonalOrganization(user: UserRow) {
  const [existing] = await db
    .select()
    .from(organizationTable)
    .where(and(eq(organizationTable.owner_id, user.id), eq(organizationTable.is_personal, true)))
    .limit(1)
  if (existing)
    return existing
  const [org] = await db.insert(organizationTable).values({
    name: `${user.name ?? user.username ?? 'My'} Organization`,
    slug: await uniqueSlug(user.username ?? user.primary_email.split('@')[0]!),
    owner_id: user.id,
    is_personal: true,
  }).returning()
  await db.insert(organizationMemberTable)
    .values({ user_id: user.id, organization_id: org!.id, abilities: [...DEFAULT_PERSONAL_ORG_ABILITIES] })
    .onConflictDoNothing()
  return org!
}
