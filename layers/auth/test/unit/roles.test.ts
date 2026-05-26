import { describe, expect, it } from 'vitest'
import { assertGrantable } from '#layers/auth/shared/permissions'

describe('assertGrantable', () => {
  it('allows tenant abilities the actor holds', () => {
    expect(assertGrantable(['project:read', 'project:write'], ['project:read'])).toEqual([])
  })

  it('returns empty array when requested list is empty', () => {
    expect(assertGrantable(['project:read'], [])).toEqual([])
  })

  it('rejects abilities the actor does not hold', () => {
    const bad = assertGrantable(['project:read'], ['project:write'])
    expect(bad).toContain('project:write')
  })

  it('rejects system-only abilities like user:impersonate even if actor holds them', () => {
    const bad = assertGrantable(['user:impersonate'], ['user:impersonate'])
    expect(bad).toContain('user:impersonate')
  })

  it('rejects completely unknown ability keys', () => {
    const bad = assertGrantable(['project:read'], ['nonexistent:action'])
    expect(bad).toContain('nonexistent:action')
  })

  it('allows multiple tenant abilities all held by actor', () => {
    expect(assertGrantable(['project:read', 'project:write', 'project:delete'], ['project:read', 'project:write'])).toEqual([])
  })

  it('deduplicates returned bad keys', () => {
    const bad = assertGrantable([], ['project:write', 'project:write'])
    expect(bad.filter(k => k === 'project:write').length).toBe(1)
  })
})
