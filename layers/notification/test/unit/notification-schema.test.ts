import { describe, expect, it } from 'vitest'
import { NotificationQuerySchema, toNotification } from '#layers/notification/shared/schemas/notification'

describe('notificationQuerySchema', () => {
  it('defaults offset/limit', () => {
    expect(NotificationQuerySchema.parse({})).toEqual({ offset: 0, limit: 20 })
  })
  it('coerces + clamps', () => {
    expect(NotificationQuerySchema.parse({ offset: '10', limit: '5' })).toEqual({ offset: 10, limit: 5 })
    expect(() => NotificationQuerySchema.parse({ limit: 999 })).toThrow()
  })
})

describe('toNotification', () => {
  it('maps a row to the wire shape', () => {
    const row = {
      id: 'n1',
      organization_id: 'o1',
      user_id: 'u1',
      sender_name: 'Jordan Brown',
      body: 'sent you a message',
      is_read: false,
      dedupe_key: null,
      created_at: new Date('2026-05-22T10:00:00.000Z'),
    }
    expect(toNotification(row)).toEqual({
      id: 'n1',
      senderName: 'Jordan Brown',
      body: 'sent you a message',
      isRead: false,
      createdAt: '2026-05-22T10:00:00.000Z',
    })
  })
})
