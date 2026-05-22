import { describe, expect, it } from 'vitest'
import { canSubjectAction, parseAbility, satisfiesAbility } from '#layers/auth/shared/ability'

describe('parseAbility', () => {
  it('parses "subject:action"', () => {
    expect(parseAbility('todo:read')).toEqual({ subject: 'todo', action: 'read', scope: undefined })
  })

  it('parses "subject:action:scope"', () => {
    expect(parseAbility('todo:delete:self')).toEqual({ subject: 'todo', action: 'delete', scope: 'self' })
  })
})

describe('satisfiesAbility (scope-precise, server gating)', () => {
  it('matches an exact unscoped ability', () => {
    expect(satisfiesAbility(['todo:read'], 'todo:read')).toBe(true)
  })

  it('matches an exact scoped ability and does not conflate scopes', () => {
    expect(satisfiesAbility(['todo:delete:self'], 'todo:delete:self')).toBe(true)
    expect(satisfiesAbility(['todo:delete:self'], 'todo:delete')).toBe(false)
    expect(satisfiesAbility(['todo:delete'], 'todo:delete:self')).toBe(false)
  })

  it('manage covers read/write/delete at the same (unscoped) scope', () => {
    expect(satisfiesAbility(['todo:manage'], 'todo:read')).toBe(true)
    expect(satisfiesAbility(['todo:manage'], 'todo:write')).toBe(true)
    expect(satisfiesAbility(['todo:manage'], 'todo:delete')).toBe(true)
  })

  it('unscoped manage does NOT cover a :self requirement', () => {
    expect(satisfiesAbility(['todo:manage'], 'todo:delete:self')).toBe(false)
  })

  it('manage never expands to impersonate (not a wildcardable action)', () => {
    expect(satisfiesAbility(['user:manage'], 'user:impersonate')).toBe(false)
    expect(satisfiesAbility(['user:impersonate'], 'user:impersonate')).toBe(true)
  })

  it('does not cross subjects', () => {
    expect(satisfiesAbility(['user:manage'], 'todo:read')).toBe(false)
  })
})

describe('canSubjectAction (scope-tolerant, page-meta visibility)', () => {
  it('matches a scoped variant for an unscoped requirement', () => {
    expect(canSubjectAction(['todo:delete:self'], 'todo:delete')).toBe(true)
  })

  it('manage covers read/write/delete', () => {
    expect(canSubjectAction(['todo:manage'], 'todo:read')).toBe(true)
    expect(canSubjectAction(['user:manage'], 'user:write')).toBe(true)
  })

  it('manage does not expand to impersonate', () => {
    expect(canSubjectAction(['user:manage'], 'user:impersonate')).toBe(false)
  })

  it('fails when subject/action absent', () => {
    expect(canSubjectAction([], 'user:read')).toBe(false)
    expect(canSubjectAction(['todo:read'], 'user:read')).toBe(false)
  })
})
