import type { ListQuery, Page } from '~~/shared/schemas/pagination'
import { db } from '@nuxthub/db'
import { organizationInvitationTable, organizationMemberRoleTable, organizationMemberTable, organizationTable, roleTable, userTable } from '@nuxthub/db/schema'
import { and, asc, eq, ne, or, sql } from 'drizzle-orm'
import { simplifyNanoId } from '~~/shared/utils/id'
import { escapeLike } from '~~/shared/utils/string'
import { DEFAULT_MEMBER_ABILITIES, DEFAULT_PERSONAL_ORG_ABILITIES, mergeOrgAbilities } from '#layers/auth/shared/permissions'

type UserRow = typeof userTable.$inferSelect

export async function getSystemOrganizationId(): Promise<string | null> {
  const org = await db.query.organizationTable.findFirst({
    where: eq(organizationTable.is_system, true),
    columns: { id: true },
  })
  return org?.id ?? null
}

async function membershipAbilities(userId: string, orgId: string): Promise<string[]> {
  const m = await db.query.organizationMemberTable.findFirst({
    where: and(eq(organizationMemberTable.user_id, userId), eq(organizationMemberTable.organization_id, orgId)),
    columns: { abilities: true },
  })
  return m?.abilities ?? []
}

export async function roleAbilities(userId: string, orgId: string): Promise<string[]> {
  const rows = await db.select({ permissions: roleTable.permissions })
    .from(organizationMemberTable)
    .innerJoin(organizationMemberRoleTable, eq(organizationMemberRoleTable.member_id, organizationMemberTable.id))
    .innerJoin(roleTable, eq(roleTable.id, organizationMemberRoleTable.role_id))
    .where(and(eq(organizationMemberTable.user_id, userId), eq(organizationMemberTable.organization_id, orgId)))
  return rows.flatMap(r => r.permissions ?? [])
}

export async function effectiveOrgGrants(userId: string, orgId: string): Promise<string[]> {
  const [custom, roles] = await Promise.all([membershipAbilities(userId, orgId), roleAbilities(userId, orgId)])
  return [...new Set([...custom, ...roles])]
}

/** Effective = system grants ∪ active-org grants, each filtered to its org kind. */
export async function loadEffectiveAbilities(userId: string, activeOrgId: string | null): Promise<string[]> {
  const systemOrgId = await getSystemOrganizationId()
  const systemGrants = systemOrgId ? await effectiveOrgGrants(userId, systemOrgId) : []
  if (!activeOrgId)
    return mergeOrgAbilities(systemGrants, [], false)
  const activeGrants = await effectiveOrgGrants(userId, activeOrgId)
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
  const existing = await db.query.organizationTable.findFirst({ where: eq(organizationTable.slug, slug) })
  if (existing)
    return existing
  const [org] = await db.insert(organizationTable).values({ slug, name, is_system: !!flags.is_system }).returning()
  await ensureSystemRoles(org!.id)
  return org!
}

/** Create a membership only if absent — preserves grants on returning users. */
export async function ensureMembership(userId: string, orgId: string, abilities: readonly string[]) {
  await db.insert(organizationMemberTable)
    .values({ user_id: userId, organization_id: orgId, abilities: [...abilities] })
    .onConflictDoNothing()
}

export async function isMember(userId: string, orgId: string): Promise<boolean> {
  const m = await db.query.organizationMemberTable.findFirst({
    where: and(eq(organizationMemberTable.user_id, userId), eq(organizationMemberTable.organization_id, orgId)),
    columns: { id: true },
  })
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
  const members = await db.query.organizationMemberTable.findMany({
    where: eq(organizationMemberTable.organization_id, orgId),
    columns: { user_id: true },
  })
  let count = 0
  for (const m of members) {
    if ((await effectiveOrgGrants(m.user_id, orgId)).includes('user:manage'))
      count++
  }
  return count
}

export async function ensureSystemRoles(orgId: string) {
  await db.insert(roleTable).values([
    { organization_id: orgId, name: 'Admin', description: 'Full workspace control', permissions: [...DEFAULT_PERSONAL_ORG_ABILITIES], is_system: true },
    { organization_id: orgId, name: 'Member', description: 'Standard member', permissions: [...DEFAULT_MEMBER_ABILITIES], is_system: true },
  ]).onConflictDoNothing()
  return db.query.roleTable.findMany({ where: eq(roleTable.organization_id, orgId) })
}

export async function assignRole(memberId: string, roleId: string) {
  await db.insert(organizationMemberRoleTable).values({ member_id: memberId, role_id: roleId }).onConflictDoNothing()
}

export async function membersWithRole(roleId: string): Promise<string[]> {
  const rows = await db.select({ user_id: organizationMemberTable.user_id })
    .from(organizationMemberRoleTable)
    .innerJoin(organizationMemberTable, eq(organizationMemberTable.id, organizationMemberRoleTable.member_id))
    .where(eq(organizationMemberRoleTable.role_id, roleId))
  return rows.map(r => r.user_id)
}

export async function uniqueSlug(base: string): Promise<string> {
  const root = base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'org'
  for (let i = 0; i < 5; i++) {
    const candidate = i === 0 ? root : `${root}-${simplifyNanoId().slice(0, 6)}`
    const hit = await db.query.organizationTable.findFirst({ where: eq(organizationTable.slug, candidate), columns: { id: true } })
    if (!hit)
      return candidate
  }
  return `${root}-${simplifyNanoId()}`
}

/** Idempotent personal org: org (is_personal) + owner membership (admin grants). */
export async function createPersonalOrganization(user: UserRow) {
  const existing = await db.query.organizationTable.findFirst({
    where: and(eq(organizationTable.owner_id, user.id), eq(organizationTable.is_personal, true)),
  })
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
  const roles = await ensureSystemRoles(org!.id)
  const adminRole = roles.find(r => r.name === 'Admin')
  if (adminRole) {
    const member = await db.query.organizationMemberTable.findFirst({
      where: and(eq(organizationMemberTable.user_id, user.id), eq(organizationMemberTable.organization_id, org!.id)),
      columns: { id: true },
    })
    if (member)
      await assignRole(member.id, adminRole.id)
  }
  return org!
}

export async function createTenantOrganization(userId: string, name: string) {
  const slug = await uniqueSlug(name)
  const [org] = await db.insert(organizationTable).values({
    name,
    slug,
    owner_id: userId,
    is_personal: false,
  }).returning()
  await db.insert(organizationMemberTable)
    .values({ user_id: userId, organization_id: org!.id, abilities: [...DEFAULT_PERSONAL_ORG_ABILITIES] })
    .onConflictDoNothing()
  const roles = await ensureSystemRoles(org!.id)
  const adminRole = roles.find(r => r.name === 'Admin')
  if (adminRole) {
    const member = await db.query.organizationMemberTable.findFirst({
      where: and(eq(organizationMemberTable.user_id, userId), eq(organizationMemberTable.organization_id, org!.id)),
      columns: { id: true },
    })
    if (member)
      await assignRole(member.id, adminRole.id)
  }
  return org!
}

export async function getOrganizationById(orgId: string) {
  const org = await db.query.organizationTable.findFirst({ where: eq(organizationTable.id, orgId) })
  return org ?? null
}

// --- Invitations -------------------------------------------------------

export async function getOrgInvitations(orgId: string) {
  return db.query.organizationInvitationTable.findMany({ where: eq(organizationInvitationTable.organization_id, orgId) })
}

export async function createInvitation(orgId: string, email: string, roleId: string | null, invitedBy: string, projectIds: string[] = []) {
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const [inv] = await db
    .insert(organizationInvitationTable)
    .values({ organization_id: orgId, email, role_id: roleId, token, invited_by: invitedBy, expires_at: expiresAt, project_ids: projectIds })
    .returning()
  return inv!
}

export async function getInvitationByToken(token: string) {
  const inv = await db.query.organizationInvitationTable.findFirst({ where: eq(organizationInvitationTable.token, token) })
  return inv ?? null
}

export async function revokeInvitation(invId: string, orgId: string) {
  await db
    .delete(organizationInvitationTable)
    .where(and(
      eq(organizationInvitationTable.id, invId),
      eq(organizationInvitationTable.organization_id, orgId),
    ))
}

export async function deleteInvitation(invId: string) {
  await db
    .delete(organizationInvitationTable)
    .where(eq(organizationInvitationTable.id, invId))
}

function nameEmailFilter(q: string) {
  if (!q)
    return undefined
  const p = `%${escapeLike(q)}%`
  return or(
    sql`${userTable.name} LIKE ${p} ESCAPE '\\'`,
    sql`${userTable.username} LIKE ${p} ESCAPE '\\'`,
    sql`${userTable.primary_email} LIKE ${p} ESCAPE '\\'`,
  )
}

export async function getUserOrganizationsPage(userId: string, { q, limit, offset }: ListQuery): Promise<Page<{ id: string, name: string, slug: string, is_personal: boolean | null }>> {
  const term = q ? `%${escapeLike(q)}%` : undefined
  const where = and(
    eq(organizationMemberTable.user_id, userId),
    eq(organizationTable.is_system, false),
    term
      ? or(sql`${organizationTable.name} LIKE ${term} ESCAPE '\\'`, sql`${organizationTable.slug} LIKE ${term} ESCAPE '\\'`)
      : undefined,
  )
  const rows = await db.select({ id: organizationTable.id, name: organizationTable.name, slug: organizationTable.slug, is_personal: organizationTable.is_personal })
    .from(organizationMemberTable)
    .innerJoin(organizationTable, eq(organizationTable.id, organizationMemberTable.organization_id))
    .where(where)
    .orderBy(asc(organizationTable.name))
    .limit(limit + 1)
    .offset(offset)
  return { items: rows.slice(0, limit), hasMore: rows.length > limit }
}

export async function getOrgMembersPage(orgId: string, { q, limit, offset }: ListQuery): Promise<Page<{ id: string, name: string | null, username: string | null, primary_email: string, avatar: string | null, abilities: string[] | null, is_suspended: boolean | null }>> {
  const where = and(eq(organizationMemberTable.organization_id, orgId), nameEmailFilter(q))
  const rows = await db.select({
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
    .where(where)
    .orderBy(asc(userTable.name))
    .limit(limit + 1)
    .offset(offset)
  return { items: rows.slice(0, limit), hasMore: rows.length > limit }
}

export async function getImpersonationCandidatesPage(selfId: string, { q, limit, offset }: ListQuery): Promise<Page<{ id: string, username: string | null, name: string | null, primary_email: string, avatar: string | null, is_suspended: boolean | null }>> {
  const where = and(ne(userTable.id, selfId), nameEmailFilter(q))
  const rows = await db.query.userTable.findMany({
    where,
    orderBy: asc(userTable.name),
    limit: limit + 1,
    offset,
    columns: { id: true, username: true, name: true, primary_email: true, avatar: true, is_suspended: true },
  })
  return { items: rows.slice(0, limit), hasMore: rows.length > limit }
}
