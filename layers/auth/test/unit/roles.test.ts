import { beforeEach, describe, expect, it } from 'vitest'
import { assertGrantable } from '#layers/auth/server/services/permissions-registry'
import { buildAbility } from '#layers/auth/shared/casl'
import { registerCoreDomainsForTest } from '#layers/auth/test/unit/_helpers/registry'

beforeEach(() => registerCoreDomainsForTest())

describe('assertGrantable', () => {
  it('allows tenant abilities the actor holds', () => {
    expect(assertGrantable(buildAbility(['project:read', 'project:write'], undefined), ['project:read'])).toEqual([])
  })

  it('returns empty array when requested list is empty', () => {
    expect(assertGrantable(buildAbility(['project:read'], undefined), [])).toEqual([])
  })

  it('rejects abilities the actor does not hold', () => {
    const bad = assertGrantable(buildAbility(['project:read'], undefined), ['project:write'])
    expect(bad).toContain('project:write')
  })

  it('rejects system-only abilities like user:impersonate even if actor holds them', () => {
    const bad = assertGrantable(buildAbility(['user:impersonate'], undefined), ['user:impersonate'])
    expect(bad).toContain('user:impersonate')
  })

  it('rejects completely unknown ability keys', () => {
    const bad = assertGrantable(buildAbility(['project:read'], undefined), ['nonexistent:action'])
    expect(bad).toContain('nonexistent:action')
  })

  it('allows multiple tenant abilities all held by actor', () => {
    expect(assertGrantable(
      buildAbility(['project:read', 'project:write', 'project:delete'], undefined),
      ['project:read', 'project:write'],
    )).toEqual([])
  })

  it('deduplicates returned bad keys', () => {
    const bad = assertGrantable(buildAbility([], undefined), ['project:write', 'project:write'])
    expect(bad.filter(k => k === 'project:write').length).toBe(1)
  })
})
