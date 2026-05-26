import { describe, expect, it } from 'vitest'
import { CreateProductSchema, UpdateProductSchema } from '#layers/product/shared/schemas/product'

describe('createProductSchema', () => {
  it('accepts a valid one-time product', () => {
    const result = CreateProductSchema.safeParse({
      name: 'Basic Plan',
      type: 'one_time',
      price: 999,
      price_currency: 'USD',
      status: 'active',
    })
    expect(result.success).toBe(true)
  })

  it('accepts a valid recurring product with billing_interval', () => {
    const result = CreateProductSchema.safeParse({
      name: 'Monthly Sub',
      type: 'recurring',
      price: 1999,
      price_currency: 'USD',
      billing_interval: 'month',
      status: 'active',
    })
    expect(result.success).toBe(true)
  })

  it('rejects recurring product without billing_interval', () => {
    const result = CreateProductSchema.safeParse({
      name: 'Bad Recurring',
      type: 'recurring',
      price: 1999,
      price_currency: 'USD',
      status: 'active',
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative price', () => {
    const result = CreateProductSchema.safeParse({
      name: 'Bad Price',
      type: 'one_time',
      price: -1,
      price_currency: 'USD',
      status: 'active',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty name', () => {
    const result = CreateProductSchema.safeParse({
      name: '',
      type: 'one_time',
      price: 0,
      price_currency: 'USD',
      status: 'active',
    })
    expect(result.success).toBe(false)
  })

  it('rejects unknown currency', () => {
    const result = CreateProductSchema.safeParse({
      name: 'Test',
      type: 'one_time',
      price: 100,
      price_currency: 'XYZ',
      status: 'active',
    })
    expect(result.success).toBe(false)
  })

  it('defaults type to one_time when omitted', () => {
    const result = CreateProductSchema.safeParse({
      name: 'Default type',
      price: 0,
      price_currency: 'USD',
      status: 'active',
    })
    expect(result.success).toBe(true)
    if (result.success)
      expect(result.data.type).toBe('one_time')
  })
})

describe('updateProductSchema', () => {
  it('accepts a partial update', () => {
    const result = UpdateProductSchema.safeParse({ name: 'New Name' })
    expect(result.success).toBe(true)
  })

  it('accepts an empty object', () => {
    const result = UpdateProductSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})
