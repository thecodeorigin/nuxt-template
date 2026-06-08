import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// The SePay webhook can be delivered more than once (provider retries / concurrent
// delivery). Crediting the balance must happen at most once per top-up: the
// transaction-status CAS claims the event, and only the claimer credits. A credit
// upsert sitting unconditionally in a db.batch would double-credit on the second
// delivery (the status update no-ops, but the +amount still applies).
describe('sepay webhook double-credit guard', () => {
  const src = readFileSync(join(process.cwd(), 'layers/billing/server/api/payments/sepay/webhook.post.ts'), 'utf8')

  it('claims the transaction with a status CAS and reads the affected rows', () => {
    expect(src).toMatch(/ne\(transactionTable\.status,\s*'success'\)/)
    expect(src).toMatch(/\.returning\(/)
  })

  it('skips crediting when the claim matched no rows', () => {
    expect(src).toMatch(/claimed\.length === 0/)
  })

  it('credits only via grantCredit (gated by the claim), not unconditionally in a batch', () => {
    const batchStart = src.indexOf('db.batch(')
    if (batchStart !== -1) {
      const block = src.slice(batchStart, src.indexOf('])', batchStart))
      expect(block).not.toMatch(/organizationCreditTable/)
    }
    expect(src).toMatch(/grantCredit\(/)
  })
})
