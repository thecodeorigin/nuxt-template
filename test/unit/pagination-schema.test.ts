import { describe, expect, it } from 'vitest'
import { ListQuerySchema } from '~~/shared/schemas/pagination'

describe('listQuerySchema', () => {
  it('applies defaults', () => {
    const r = ListQuerySchema.parse({})
    expect(r.q).toBe('')
    expect(r.limit).toBe(20)
    expect(r.offset).toBe(0)
  })
  it('rejects limit above 50', () => {
    expect(() => ListQuerySchema.parse({ limit: '9999' })).toThrow()
  })
  it('accepts limit at 50', () => {
    expect(ListQuerySchema.parse({ limit: '50' }).limit).toBe(50)
  })
  it('rejects negative offset', () => {
    expect(() => ListQuerySchema.parse({ offset: '-1' })).toThrow()
  })
  it('trims q', () => {
    expect(ListQuerySchema.parse({ q: '  hello  ' }).q).toBe('hello')
  })
  it('caps q at 100 chars', () => {
    expect(() => ListQuerySchema.parse({ q: 'a'.repeat(101) })).toThrow()
  })
})
