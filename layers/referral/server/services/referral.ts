import { db } from '@nuxthub/db'
import { organizationTable, userTable } from '@nuxthub/db/schema'
import { and, desc, eq } from 'drizzle-orm'
import { sumBy } from 'es-toolkit'
import { simplifyNanoId } from '~~/shared/utils/id'
import { referralTable, userReferralTable } from '#layers/referral/server/db/schema'

export const REF_CODE_RE = /^[a-z0-9]{8}$/i
export const REFERRAL_REWARD = 20000

export async function ensureReferralCode(userId: string): Promise<string> {
  const existing = await db.query.userReferralTable.findFirst({ where: eq(userReferralTable.user_id, userId) })
  if (existing)
    return existing.code
  const code = simplifyNanoId(8)
  const [row] = await db.insert(userReferralTable).values({ user_id: userId, code }).onConflictDoNothing().returning()
  if (row)
    return row.code
  const retry = await db.query.userReferralTable.findFirst({ where: eq(userReferralTable.user_id, userId) })
  return retry!.code
}

export async function attributeReferral(refereeId: string, opts: { code?: string | null, inviterId?: string | null }): Promise<void> {
  let referrerId: string | null = null
  if (opts.code && REF_CODE_RE.test(opts.code)) {
    const r = await db.query.userReferralTable.findFirst({
      where: eq(userReferralTable.code, opts.code),
      columns: { user_id: true },
    })
    referrerId = r?.user_id ?? null
  }
  else if (opts.inviterId) {
    referrerId = opts.inviterId
  }
  if (!referrerId || referrerId === refereeId)
    return
  await db.insert(referralTable)
    .values({ referrer_id: referrerId, referee_id: refereeId, source: opts.code ? 'link' : 'invite' })
    .onConflictDoNothing()
}

export async function getReferralStats(userId: string) {
  const code = await ensureReferralCode(userId)
  const rows = await db
    .select({
      id: referralTable.id,
      email: userTable.primary_email,
      source: referralTable.source,
      reward_paid: referralTable.reward_paid,
      created_at: referralTable.created_at,
    })
    .from(referralTable)
    .innerJoin(userTable, eq(userTable.id, referralTable.referee_id))
    .where(eq(referralTable.referrer_id, userId))
    .orderBy(desc(referralTable.created_at))
  return {
    code,
    referredCount: rows.length,
    totalEarned: sumBy(rows, r => r.reward_paid ? REFERRAL_REWARD : 0),
    referrals: rows,
  }
}

export async function personalOrgId(userId: string): Promise<string | null> {
  const org = await db.query.organizationTable.findFirst({
    where: and(eq(organizationTable.owner_id, userId), eq(organizationTable.is_personal, true)),
    columns: { id: true },
  })
  return org?.id ?? null
}
