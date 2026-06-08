import { db } from '@nuxthub/db'
import { organizationCreditTable, referralTable, transactionTable } from '@nuxthub/db/schema'
import { and, eq, sql } from 'drizzle-orm'
import { deleteCookie, getCookie } from 'h3'
import { REFERRAL_REWARD } from '#layers/referral/server/constants/defaults'
import { attributeReferral, ensureReferralCode, personalOrgId } from '#layers/referral/server/services/referral'

const REAL_PROVIDERS = new Set(['google', 'github'])

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('auth:user-created', async ({ user, provider, event }) => {
    await ensureReferralCode(user.id)
    if (!REAL_PROVIDERS.has(provider))
      return
    const code = getCookie(event, 'ref')
    const inviterId = getCookie(event, 'ref_invite')
    await attributeReferral(user.id, { code, inviterId })
    deleteCookie(event, 'ref')
    deleteCookie(event, 'ref_invite')
  })

  nitro.hooks.hook('billing:topup-succeeded', async ({ userId, isFirstTopup }) => {
    if (!isFirstTopup || !userId)
      return
    const ref = await db.query.referralTable.findFirst({
      where: and(eq(referralTable.referee_id, userId), eq(referralTable.reward_paid, false)),
    })
    if (!ref)
      return
    const sink = await personalOrgId(ref.referrer_id)
    if (!sink)
      return
    // Atomic: the reward transaction, the reward_paid flag, and the credit grant
    // commit (or roll back) together. D1 batch() runs as one implicit transaction.
    await db.batch([
      db.insert(transactionTable).values({
        organization_id: sink,
        user_id: ref.referrer_id,
        type: 'referral_reward',
        status: 'success',
        amount: REFERRAL_REWARD,
        metadata: { referee_id: userId },
      }),
      db.update(referralTable).set({ reward_paid: true }).where(eq(referralTable.id, ref.id)),
      db.insert(organizationCreditTable)
        .values({ organization_id: sink, balance: REFERRAL_REWARD })
        .onConflictDoUpdate({
          target: organizationCreditTable.organization_id,
          set: { balance: sql`${organizationCreditTable.balance} + ${REFERRAL_REWARD}` },
        }),
    ])
  })
})
