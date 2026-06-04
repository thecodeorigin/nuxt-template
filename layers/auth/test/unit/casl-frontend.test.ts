import { describe, expect, it } from 'vitest'
import { pageMetaCanCheck } from '#layers/auth/app/composables/casl'
import { abilitiesToRules, buildAbility } from '#layers/auth/shared/casl'

describe('abilitiesToRules (consumed by @casl/ability)', () => {
  it('converts plain abilities to action+subject rules', () => {
    expect(abilitiesToRules(['blog:read', 'user:read'], 'user-1')).toEqual([
      { action: 'read', subject: 'blog' },
      { action: 'read', subject: 'user' },
    ])
  })

  it('adds a { user_id } condition for ":self" abilities', () => {
    expect(abilitiesToRules(['blog:write:self'], 'user-1')).toEqual([
      { action: 'write', subject: 'blog', conditions: { user_id: 'user-1' } },
    ])
  })

  it('omits the condition when no userId is available (e.g. logged-out)', () => {
    expect(abilitiesToRules(['blog:write:self'], undefined)).toEqual([
      { action: 'write', subject: 'blog' },
    ])
  })
})

describe('pageMetaCanCheck — definePageMeta({ can: [...] })', () => {
  it('passes when no abilities are required', () => {
    expect(pageMetaCanCheck(buildAbility([], undefined), [])).toBe(true)
  })

  it('passes when the user has the exact ability', () => {
    expect(pageMetaCanCheck(buildAbility(['blog:read'], 'u1'), ['blog:read'])).toBe(true)
  })

  it('passes when the user has a scoped variant (scope-agnostic)', () => {
    expect(pageMetaCanCheck(buildAbility(['blog:read:self'], 'u1'), ['blog:read'])).toBe(true)
  })

  it('fails when the user lacks the ability entirely', () => {
    expect(pageMetaCanCheck(buildAbility([], undefined), ['blog:read'])).toBe(false)
    expect(pageMetaCanCheck(buildAbility(['user:read'], 'u1'), ['blog:read'])).toBe(false)
  })

  it('passes when the user has ANY of the listed abilities (OR semantics)', () => {
    expect(pageMetaCanCheck(buildAbility(['blog:read'], 'u1'), ['blog:read', 'user:read'])).toBe(true)
    expect(pageMetaCanCheck(buildAbility(['user:read'], 'u1'), ['blog:read', 'user:read'])).toBe(true)
    expect(pageMetaCanCheck(buildAbility(['other:read'], 'u1'), ['blog:read', 'user:read'])).toBe(false)
  })

  it('passes via the "manage" wildcard for wildcardable actions', () => {
    expect(pageMetaCanCheck(buildAbility(['user:manage'], 'u1'), ['user:read'])).toBe(true)
  })

  it('cASL manage implies impersonate in page-meta (known behavior change from canSubjectAction)', () => {
    // CASL's 'manage' = any action. On the frontend this is acceptable — page-meta is
    // UI gating only. The server independently guards non-wildcardable system actions.
    // Previously canSubjectAction returned false here; now CASL returns true.
    expect(pageMetaCanCheck(buildAbility(['user:manage'], 'u1'), ['user:impersonate'])).toBe(true)
  })
})
