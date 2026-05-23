import { describe, expect, it } from 'vitest'
import { assertGrantable } from '#layers/auth/shared/permissions'

describe('assertGrantable', () => {
  it('allows tenant abilities the actor holds', () => {
    expect(assertGrantable(['todo:read', 'todo:write'], ['todo:read'])).toEqual([])
  })

  it('returns empty array when requested list is empty', () => {
    expect(assertGrantable(['todo:read'], [])).toEqual([])
  })

  it('rejects abilities the actor does not hold', () => {
    const bad = assertGrantable(['todo:read'], ['todo:write'])
    expect(bad).toContain('todo:write')
  })

  it('rejects system-only abilities like user:impersonate even if actor holds them', () => {
    const bad = assertGrantable(['user:impersonate'], ['user:impersonate'])
    expect(bad).toContain('user:impersonate')
  })

  it('rejects completely unknown ability keys', () => {
    const bad = assertGrantable(['todo:read'], ['nonexistent:action'])
    expect(bad).toContain('nonexistent:action')
  })

  it('allows multiple tenant abilities all held by actor', () => {
    expect(assertGrantable(['todo:read', 'todo:write', 'todo:delete'], ['todo:read', 'todo:write'])).toEqual([])
  })

  it('deduplicates returned bad keys', () => {
    const bad = assertGrantable([], ['todo:write', 'todo:write'])
    expect(bad.filter(k => k === 'todo:write').length).toBe(1)
  })
})
