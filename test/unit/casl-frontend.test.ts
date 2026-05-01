import { describe, expect, it } from 'vitest'
import { abilitiesToRules, pageMetaCanCheck, parseAbility } from '~/services/casl'

describe('parseAbility (frontend)', () => {
  it('parses "subject:action"', () => {
    expect(parseAbility('blog:read')).toEqual({ subject: 'blog', action: 'read', scope: undefined })
  })

  it('parses "subject:action:scope"', () => {
    expect(parseAbility('blog:read:self')).toEqual({ subject: 'blog', action: 'read', scope: 'self' })
  })
})

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
    expect(pageMetaCanCheck([], [])).toBe(true)
  })

  it('passes when the user has the exact ability', () => {
    expect(pageMetaCanCheck(['blog:read'], ['blog:read'])).toBe(true)
  })

  it('passes when the user has a scoped variant (scope-agnostic)', () => {
    expect(pageMetaCanCheck(['blog:read:self'], ['blog:read'])).toBe(true)
  })

  it('fails when the user lacks the ability entirely', () => {
    expect(pageMetaCanCheck([], ['blog:read'])).toBe(false)
    expect(pageMetaCanCheck(['user:read'], ['blog:read'])).toBe(false)
  })

  it('requires ALL listed abilities (AND semantics)', () => {
    expect(pageMetaCanCheck(['blog:read'], ['blog:read', 'user:read'])).toBe(false)
    expect(pageMetaCanCheck(['blog:read', 'user:read'], ['blog:read', 'user:read'])).toBe(true)
  })
})
