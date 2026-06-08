import { describe, expect, it } from 'vitest'
import { isEmailEnabled } from '#layers/auth/server/services/email'
import { composeEmailHtml, dispatchJobKey, sendDispatchMessage, toDispatchPayloads } from '#layers/system/server/services/dispatch'
import { DispatchFilterSchema, DispatchSendSchema, htmlHasText } from '#layers/system/shared/schemas/dispatch'

describe('isEmailEnabled', () => {
  it('defaults to enabled when prefs are missing/partial', () => {
    expect(isEmailEnabled(null)).toBe(true)
    expect(isEmailEnabled(undefined)).toBe(true)
    expect(isEmailEnabled({})).toBe(true)
    expect(isEmailEnabled({ email: true })).toBe(true)
  })
  it('only an explicit false disables', () => {
    expect(isEmailEnabled({ email: false })).toBe(false)
  })
})

describe('composeEmailHtml', () => {
  it('escapes HTML metacharacters in the subject', () => {
    expect(composeEmailHtml('<b>Hi</b>', '<p>ok</p>')).toContain('&lt;b&gt;Hi&lt;/b&gt;')
  })
  it('embeds the body HTML verbatim', () => {
    expect(composeEmailHtml('s', '<p>Hello <strong>world</strong></p>'))
      .toContain('<p>Hello <strong>world</strong></p>')
  })
  it('wraps content in a static shell', () => {
    expect(composeEmailHtml('s', '<p>b</p>').startsWith('<!doctype html>')).toBe(true)
  })
})

describe('htmlHasText', () => {
  it('is false for empty editor output', () => {
    expect(htmlHasText('<p></p>')).toBe(false)
    expect(htmlHasText('<p>  </p>')).toBe(false)
    expect(htmlHasText('<p>&nbsp;</p>')).toBe(false)
  })
  it('is true when there is text or an image', () => {
    expect(htmlHasText('<p>hi</p>')).toBe(true)
    expect(htmlHasText('<p><img src="x"></p>')).toBe(true)
  })
})

describe('dispatch queue payloads', () => {
  it('builds a stable, namespaced job key', () => {
    expect(dispatchJobKey('abc')).toBe('dispatch:job:abc')
  })
  it('maps recipients to per-recipient payloads sharing one dispatch id', () => {
    const users = [
      { id: '1', primary_email: 'a@b.com', notification_prefs: null },
      { id: '2', primary_email: 'c@d.com', notification_prefs: { email: true } },
    ]
    expect(toDispatchPayloads('d1', users)).toEqual([
      { dispatchId: 'd1', user: users[0] },
      { dispatchId: 'd1', user: users[1] },
    ])
  })
  it('sendDispatchMessage no-ops when the job blob is gone (acks a poison message)', async () => {
    await expect(
      sendDispatchMessage({ dispatchId: 'missing', user: { id: '1', primary_email: 'a@b.com', notification_prefs: null } }),
    ).resolves.toBeUndefined()
  })
})

describe('dispatchFilterSchema', () => {
  it('rejects an empty filter', () => {
    expect(DispatchFilterSchema.safeParse({}).success).toBe(false)
  })
  it('accepts allUsers', () => {
    expect(DispatchFilterSchema.safeParse({ allUsers: true }).success).toBe(true)
  })
  it('normalizes emails and rejects invalid ones', () => {
    const ok = DispatchFilterSchema.safeParse({ emails: ['  A@B.COM '] })
    expect(ok.success).toBe(true)
    if (ok.success)
      expect(ok.data.emails).toEqual(['a@b.com'])
    expect(DispatchFilterSchema.safeParse({ emails: ['nope'] }).success).toBe(false)
  })
})

describe('dispatchSendSchema', () => {
  const base = { filter: { allUsers: true }, subject: 'Hello', body: 'Body' }
  it('accepts a valid payload', () => {
    expect(DispatchSendSchema.safeParse(base).success).toBe(true)
  })
  it('rejects a subject with CR/LF (header injection)', () => {
    expect(DispatchSendSchema.safeParse({ ...base, subject: 'Hi\nBcc: x@y.com' }).success).toBe(false)
  })
  it('rejects empty subject or body', () => {
    expect(DispatchSendSchema.safeParse({ ...base, subject: '' }).success).toBe(false)
    expect(DispatchSendSchema.safeParse({ ...base, body: '' }).success).toBe(false)
  })
  it('rejects an empty-HTML body', () => {
    expect(DispatchSendSchema.safeParse({ ...base, body: '<p></p>' }).success).toBe(false)
  })
})
