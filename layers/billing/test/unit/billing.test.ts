import { describe, expect, it } from 'vitest'
import { CheckoutSchema, SepayWebhookSchema } from '#layers/billing/shared/schemas/billing'
import { safeEqual } from '#layers/billing/shared/utils/crypto'

describe('safeEqual', () => {
  it('returns true for identical strings', () => {
    expect(safeEqual('secret', 'secret')).toBe(true)
  })
  it('returns false for different strings', () => {
    expect(safeEqual('secret', 'wrong')).toBe(false)
  })
  it('returns false for different lengths', () => {
    expect(safeEqual('short', 'longer-string')).toBe(false)
  })
})

describe('checkoutSchema', () => {
  it('accepts valid amount', () => {
    expect(CheckoutSchema.parse({ amount: 50000 }).amount).toBe(50000)
  })
  it('rejects below minimum', () => {
    expect(() => CheckoutSchema.parse({ amount: 1000 })).toThrow()
  })
  it('rejects above maximum', () => {
    expect(() => CheckoutSchema.parse({ amount: 100_000_000 })).toThrow()
  })
})

describe('sepayWebhookSchema', () => {
  it('parses a valid payload', () => {
    const parsed = SepayWebhookSchema.parse({ id: 123, transferAmount: 50000, transferType: 'in', content: 'SP123', code: 'SP123' })
    expect(parsed.id).toBe('123')
    expect(parsed.transferAmount).toBe(50000)
  })
  it('defaults content to empty string', () => {
    const parsed = SepayWebhookSchema.parse({ id: '1', transferAmount: 10000, transferType: 'in' })
    expect(parsed.content).toBe('')
  })
})
