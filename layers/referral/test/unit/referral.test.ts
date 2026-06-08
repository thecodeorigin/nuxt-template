import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { REF_CODE_RE } from '#layers/referral/server/services/referral'

describe('referral REF_CODE_RE', () => {
  it('matches 8-char alphanumeric', () => {
    expect(REF_CODE_RE.test('AbCd1234')).toBe(true)
  })
  it('rejects too short', () => {
    expect(REF_CODE_RE.test('AbC123')).toBe(false)
  })
  it('rejects too long', () => {
    expect(REF_CODE_RE.test('AbCd12345')).toBe(false)
  })
  it('rejects special chars', () => {
    expect(REF_CODE_RE.test('AbCd123!')).toBe(false)
  })
})

// §4 bug 1: the referral reward (transaction insert + reward_paid flag + credit
// grant) must commit atomically. A credit write OUTSIDE the db.batch can fail
// after reward_paid is already true, leaving the referrer permanently under-paid
// with no retry. This guards the source against that regression.
describe('referral reward atomicity', () => {
  const src = readFileSync(join(process.cwd(), 'layers/referral/server/plugins/referral.ts'), 'utf8')

  it('does not grant credit via a separate write after the batch', () => {
    expect(src).not.toMatch(/grantCredit\s*\(/)
  })

  it('includes the credit upsert inside db.batch', () => {
    const start = src.indexOf('db.batch([')
    expect(start).toBeGreaterThan(-1)
    const block = src.slice(start, src.indexOf('])', start))
    expect(block).toMatch(/organizationCreditTable/)
    expect(block).toMatch(/onConflictDoUpdate/)
  })
})
