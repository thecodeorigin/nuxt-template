import { db } from '@nuxthub/db'
import { organizationTable } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { referralTable, userReferralTable } from '#layers/referral/server/db/schema'

export const REF_CODE_RE = /^[a-z0-9]{8}$/i
export const REFERRAL_REWARD = 20000

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 8; i++)
    result += chars[Math.floor(Math.random() * chars.length)]
  return result
}

export async function ensureReferralCode(userId: string): Promise<string> {
  const [existing] = await db.select().from(userReferralTable).where(eq(userReferralTable.user_id, userId)).limit(1)
  if (existing)
    return existing.code
  const code = generateCode()
  const [row] = await db.insert(userReferralTable).values({ user_id: userId, code }).onConflictDoNothing().returning()
  if (row)
    return row.code
  const [retry] = await db.select().from(userReferralTable).where(eq(userReferralTable.user_id, userId)).limit(1)
  return retry!.code
}

export async function attributeReferral(refereeId: string, opts: { code?: string | null, inviterId?: string | null }): Promise<void> {
  let referrerId: string | null = null
  if (opts.code && REF_CODE_RE.test(opts.code)) {
    const [r] = await db.select({ user_id: userReferralTable.user_id })
      .from(userReferralTable)
      .where(eq(userReferralTable.code, opts.code))
      .limit(1)
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

export async function getReferralStats(userId: string): Promise<{ code: string, referredCount: number }> {
  const code = await ensureReferralCode(userId)
  const referred = await db.select({ id: referralTable.id })
    .from(referralTable)
    .where(eq(referralTable.referrer_id, userId))
  return { code, referredCount: referred.length }
}

export async function personalOrgId(userId: string): Promise<string | null> {
  const [org] = await db.select({ id: organizationTable.id })
    .from(organizationTable)
    .where(and(eq(organizationTable.owner_id, userId), eq(organizationTable.is_personal, true)))
    .limit(1)
  return org?.id ?? null
}
