import { describe, expect, it } from 'vitest'
import { NewTodoSchema, UpdateTodoSchema } from '~~/shared/schemas/todo'

describe('newTodoSchema', () => {
  it('accepts a valid title', () => {
    expect(NewTodoSchema.parse({ title: 'buy milk' })).toEqual({ title: 'buy milk' })
  })

  it('trims whitespace', () => {
    expect(NewTodoSchema.parse({ title: '  buy milk  ' })).toEqual({ title: 'buy milk' })
  })

  it('rejects an empty title', () => {
    expect(() => NewTodoSchema.parse({ title: '' })).toThrow()
    expect(() => NewTodoSchema.parse({ title: '   ' })).toThrow()
  })

  it('rejects a title longer than 200 chars', () => {
    expect(() => NewTodoSchema.parse({ title: 'a'.repeat(201) })).toThrow()
  })
})

describe('updateTodoSchema', () => {
  it('requires at least one field', () => {
    expect(() => UpdateTodoSchema.parse({})).toThrow()
  })

  it('accepts partial updates', () => {
    expect(UpdateTodoSchema.parse({ completed: true })).toEqual({ completed: true })
    expect(UpdateTodoSchema.parse({ title: 'new title' })).toEqual({ title: 'new title' })
  })
})
