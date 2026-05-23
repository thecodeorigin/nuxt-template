import { db } from '@nuxthub/db'
import { organizationCreditTable } from '@nuxthub/db/schema'
import { eq, sql } from 'drizzle-orm'

export async function getBalance(orgId: string): Promise<number> {
  const [row] = await db.select({ b: organizationCreditTable.balance })
    .from(organizationCreditTable)
    .where(eq(organizationCreditTable.organization_id, orgId))
    .limit(1)
  return row?.b ?? 0
}

export async function grantCredit(orgId: string, amount: number): Promise<void> {
  await db.insert(organizationCreditTable)
    .values({ organization_id: orgId, balance: amount })
    .onConflictDoUpdate({
      target: organizationCreditTable.organization_id,
      set: { balance: sql`${organizationCreditTable.balance} + ${amount}` },
    })
}
