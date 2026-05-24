import { expect, test } from '@nuxt/test-utils/playwright'
import {
  BOB_EMAIL,
  demoLoginSessionId,
  devCleanup,
  devLogin,
  devProvision,
  devSeed,
  FORBIDDEN_URL,
  setCookieSession,
  uniqueEmail,
} from '../../auth/tests/helpers/auth'
import { clearMaildev, getMaildevEmails, maildevReachable } from './helpers/maildev'

const SEED_EMAILS = ['admin@seed.local', 'alice@seed.local', BOB_EMAIL]

test.describe('system email dispatch', () => {
  const extraEmails: string[] = []

  test.beforeAll(async ({ request }) => {
    await devSeed(request)
  })
  test.afterAll(async ({ request }) => {
    await devCleanup(request, [...SEED_EMAILS, ...extraEmails])
  })
  test.beforeEach(async ({ context }) => {
    await context.clearCookies()
  })

  test('non-admin: page → /forbidden and all dispatch APIs 403', async ({ page, context, request, baseURL }) => {
    const { session_id } = await devLogin(baseURL!, BOB_EMAIL)
    await setCookieSession(context, baseURL!, session_id)

    await page.goto('/system/notifications')
    await expect(page).toHaveURL(FORBIDDEN_URL)

    const h = { 'x-session-id': session_id }
    expect((await request.get('/api/system/dispatch/options', { headers: h })).status()).toBe(403)
    expect((await request.post('/api/system/dispatch/preview', { headers: h, data: { allUsers: true } })).status()).toBe(403)
    expect((await request.post('/api/system/dispatch/send', { headers: h, data: { filter: { allUsers: true }, subject: 'x', body: 'y' } })).status()).toBe(403)
  })

  test('admin: sees the tool; preview returns counts only (no addresses)', async ({ page, context, request, baseURL }) => {
    const { session_id } = await demoLoginSessionId(baseURL!, 'admin')
    await setCookieSession(context, baseURL!, session_id)

    await page.goto('/system/notifications')
    await expect(page).not.toHaveURL(FORBIDDEN_URL)

    const res = await request.post('/api/system/dispatch/preview', {
      headers: { 'x-session-id': session_id },
      data: { allUsers: true },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body).toHaveProperty('total')
    expect(body).toHaveProperty('enabled')
    expect(body).toHaveProperty('skipped')
    expect(JSON.stringify(body)).not.toContain('@') // no addresses leaked
  })

  test('opt-out users are skipped, never enabled', async ({ request, baseURL }) => {
    const { session_id: adminSid } = await demoLoginSessionId(baseURL!, 'admin')
    const email = uniqueEmail('optout')
    extraEmails.push(email)
    const optOut = await devProvision(baseURL!, email, 'Opt Out')

    const off = await request.patch('/api/user/notification', {
      headers: { 'x-session-id': optOut.session_id },
      data: { email: false, product_updates: false, weekly_digest: false, important_updates: false },
    })
    expect(off.ok()).toBeTruthy()

    const preview = await (await request.post('/api/system/dispatch/preview', {
      headers: { 'x-session-id': adminSid },
      data: { emails: [email] },
    })).json()
    expect(preview.total).toBe(1)
    expect(preview.enabled).toBe(0)
    expect(preview.skipped).toBe(1)

    const send = await (await request.post('/api/system/dispatch/send', {
      headers: { 'x-session-id': adminSid },
      data: { filter: { emails: [email] }, subject: 'Should not arrive', body: 'no' },
    })).json()
    expect(send.sent).toBe(0)
    expect(send.skipped).toBe(1)
  })

  test('subject with a newline is rejected (400)', async ({ request, baseURL }) => {
    const { session_id } = await demoLoginSessionId(baseURL!, 'admin')
    const res = await request.post('/api/system/dispatch/send', {
      headers: { 'x-session-id': session_id },
      data: { filter: { allUsers: true }, subject: 'Hi\nBcc: evil@x.com', body: 'b' },
    })
    expect(res.status()).toBe(400)
  })

  test('a real send is delivered to maildev', async ({ request, baseURL }) => {
    test.skip(!(await maildevReachable()), 'maildev not running on :1080 (pnpm mail:dev)')
    await clearMaildev()

    const { session_id: adminSid } = await demoLoginSessionId(baseURL!, 'admin')
    const email = uniqueEmail('deliver')
    extraEmails.push(email)
    await devProvision(baseURL!, email, 'Deliver Me') // default prefs → email on

    const subject = `Dispatch ${Date.now()}`
    const send = await request.post('/api/system/dispatch/send', {
      headers: { 'x-session-id': adminSid },
      data: { filter: { emails: [email] }, subject, body: 'Hello there' },
    })
    expect(send.ok()).toBeTruthy()
    expect((await send.json()).sent).toBe(1)

    let caught: { subject: string, to: { address: string }[] } | undefined
    for (let i = 0; i < 15 && !caught; i++) {
      caught = (await getMaildevEmails()).find(m => m.subject === subject)
      if (!caught)
        await new Promise(r => setTimeout(r, 200))
    }
    expect(caught).toBeTruthy()
    expect(caught!.to.some(t => t.address === email)).toBe(true)
  })
})
