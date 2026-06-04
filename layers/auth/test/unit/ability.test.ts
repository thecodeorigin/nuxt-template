import { describe, expect, it } from 'vitest'
import { parseAbility } from '#layers/auth/shared/ability'

describe('parseAbility', () => {
  it('parses "subject:action"', () => {
    expect(parseAbility('todo:read')).toEqual({ subject: 'todo', action: 'read', scope: undefined })
  })

  it('parses "subject:action:scope"', () => {
    expect(parseAbility('todo:delete:self')).toEqual({ subject: 'todo', action: 'delete', scope: 'self' })
  })
})
