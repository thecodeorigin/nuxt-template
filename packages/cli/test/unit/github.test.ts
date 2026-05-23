import { describe, expect, it } from 'vitest'
import { missingConfig } from '../../src/lib/github'

describe('missingConfig', () => {
  it('lists required names not present', () => {
    expect(missingConfig(['A'], ['A', 'B', 'C'] as const)).toEqual(['B', 'C'])
  })
  it('returns empty when all present', () => {
    expect(missingConfig(['A', 'B'], ['A', 'B'] as const)).toEqual([])
  })
})
