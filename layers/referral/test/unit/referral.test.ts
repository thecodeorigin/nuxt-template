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
