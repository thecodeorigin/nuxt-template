import { describe, expect, it } from 'vitest'
import { toTodo } from '#layers/todo/shared/schemas/todo'

// CRUD/org-scope behaviour is exercised by the Playwright e2e suite
// (Drizzle against D1 is not mockable in a unit environment).
// This file guards the row→wire mapper that every route uses.
describe('toTodo', () => {
  it('maps a DB row to the wire Todo shape', () => {
    const date = new Date('2026-01-15T10:00:00.000Z')
    const row = {
      id: 'abc',
      organization_id: 'org-1',
      user_id: 'user-1',
      title: 'buy milk',
      completed: false,
      created_at: date,
      updated_at: null,
    }
    expect(toTodo(row)).toEqual({
      id: 'abc',
      title: 'buy milk',
      completed: false,
      createdAt: '2026-01-15T10:00:00.000Z',
    })
  })

  it('preserves completed=true', () => {
    const row = {
      id: 'x',
      organization_id: 'org-1',
      user_id: null,
      title: 'done task',
      completed: true,
      created_at: new Date('2026-03-01T00:00:00.000Z'),
      updated_at: null,
    }
    expect(toTodo(row).completed).toBe(true)
  })
})
