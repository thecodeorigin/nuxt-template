import { describe, expect, it } from 'vitest'
import { escapeEmailHtml, isTicketStale } from '#layers/support/server/services/ticket-helpers'
import { CreateTicketSchema } from '#layers/support/shared/schemas/ticket'

const DAY = 24 * 60 * 60 * 1000

describe('createTicketSchema', () => {
  it('feedback must not carry a category', () => {
    expect(CreateTicketSchema.safeParse({ kind: 'feedback', subject: 'a', body: 'b' }).success).toBe(true)
    expect(CreateTicketSchema.safeParse({ kind: 'feedback', category: 'billing', subject: 'a', body: 'b' }).success).toBe(false)
  })
  it('support requires a category', () => {
    expect(CreateTicketSchema.safeParse({ kind: 'support', subject: 'a', body: 'b' }).success).toBe(false)
    expect(CreateTicketSchema.safeParse({ kind: 'support', category: 'technical', subject: 'a', body: 'b' }).success).toBe(true)
  })
  it('enforces length limits', () => {
    expect(CreateTicketSchema.safeParse({ kind: 'feedback', subject: 'x'.repeat(201), body: 'b' }).success).toBe(false)
    expect(CreateTicketSchema.safeParse({ kind: 'feedback', subject: 'a', body: 'x'.repeat(5001) }).success).toBe(false)
  })
})

describe('escapeEmailHtml', () => {
  it('escapes html-significant chars', () => {
    expect(escapeEmailHtml('<a href="x">&\'')).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&#39;')
  })
})

describe('isTicketStale', () => {
  const now = new Date()
  const base = { last_message_role: 'agent', status: 'active', reminder_sent_at: null as Date | null }
  it('stale when agent-last, >24h, not reminded', () => {
    expect(isTicketStale({ ...base, last_message_at: new Date(now.getTime() - 2 * DAY) }, now)).toBe(true)
  })
  it('not stale when user replied last', () => {
    expect(isTicketStale({ ...base, last_message_role: 'user', last_message_at: new Date(now.getTime() - 2 * DAY) }, now)).toBe(false)
  })
  it('not stale within 24h', () => {
    expect(isTicketStale({ ...base, last_message_at: new Date(now.getTime() - 1000) }, now)).toBe(false)
  })
  it('not stale when already reminded for this message', () => {
    const t = new Date(now.getTime() - 2 * DAY)
    expect(isTicketStale({ ...base, last_message_at: t, reminder_sent_at: new Date(t.getTime() + 1) }, now)).toBe(false)
  })
  it('not stale when closed', () => {
    expect(isTicketStale({ ...base, status: 'closed', last_message_at: new Date(now.getTime() - 2 * DAY) }, now)).toBe(false)
  })
})
