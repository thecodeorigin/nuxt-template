import { db } from '@nuxthub/db'
import { organizationCreditTable, referralTable, transactionTable } from '@nuxthub/db/schema'
import { and, eq, sql } from 'drizzle-orm'
import { REFERRAL_REWARD } from '#layers/referral/server/constants/defaults'
import { personalOrgId } from '#layers/referral/server/services/referral'

export default defineNitroPlugin((nitro) => {
  // @ts-expect-error — billing:topup-succeeded is a custom app-level hook
  nitro.hooks.hook('billing:topup-succeeded', async ({ userId, isFirstTopup }: { userId: string, isFirstTopup: boolean }) => {
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
