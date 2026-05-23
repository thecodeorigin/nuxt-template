import { expect, test } from '@nuxt/test-utils/playwright'
import {
  ALICE_EMAIL,
  BOB_EMAIL,
  demoLoginSessionId,
  devCleanup,
  devLogin,
  devProvision,
  devSeed,
  setCookieSession,
  uniqueEmail,
} from './helpers/auth'

const INVITED_TO_JOIN_RE = /invited to join/i
const LOGIN_URL = /\/auth\/login/
const DASHBOARD_URL = /\/dashboard/
const ERROR_RE = /not found|expired|invalid/i

test.describe('invitations and join flow', () => {
  const cleanupEmails: string[] = []

  test.beforeAll(async ({ request }) => {
    // Purge any leftover invitations + seed users from aborted previous runs
    // before re-seeding, so no duplicate-invitation 409s pollute the tests.
    await devCleanup(request, [BOB_EMAIL, ALICE_EMAIL])
    await devSeed(request)
  })

  test.afterAll(async ({ request }) => {
    await devCleanup(request, [...cleanupEmails, BOB_EMAIL, ALICE_EMAIL])
  })

  // ── Headline UI flow ──────────────────────────────────────────────────────

  test('existing user opens join link while logged out, logs in, and joins', async ({
    page,
    context,
    request,
    baseURL,
    goto,
  }) => {
    const inviterEmail = uniqueEmail('inviter')
    cleanupEmails.push(inviterEmail)
    const inviter = await devProvision(baseURL!, inviterEmail, 'Inviter')

    const invRes = await request.post('/api/organization/invitations', {
      headers: { 'x-session-id': inviter.session_id },
      data: { email: BOB_EMAIL },
    })
    expect(invRes.ok()).toBe(true)
    const { token } = await invRes.json()

    // Visit join page while logged out — see invite preview and sign-in prompt
    await context.clearCookies()
    await goto(`/join/${token}`, { waitUntil: 'hydration' })
    await expect(page.getByText(INVITED_TO_JOIN_RE)).toBeVisible()
    await page.getByRole('button', { name: 'Sign in to accept' }).click()
    await expect(page).toHaveURL(LOGIN_URL)

    // Log in as bob, re-navigate to the join page (B4: no auto-redirect back)
    const bob = await devLogin(baseURL!, BOB_EMAIL)
    await setCookieSession(context, baseURL!, bob.session_id)
    await goto(`/join/${token}`, { waitUntil: 'hydration' })
    await page.getByRole('button', { name: 'Accept invitation' }).click()
    await expect(page).toHaveURL(DASHBOARD_URL)

    // Membership is live (refreshUserSessions ran): bob's org list now includes inviter's org
    const orgs = await (await request.get('/api/organizations', { headers: { 'x-session-id': bob.session_id } })).json()
    expect(orgs.items.some((o: { name: string }) => o.name.includes('Inviter'))).toBe(true)
  })

  test('invalid token shows an error message', async ({ context, goto, page }) => {
    await context.clearCookies()
    await goto('/join/this-token-does-not-exist', { waitUntil: 'hydration' })
    await expect(page.getByText(ERROR_RE)).toBeVisible()
  })

  // ── API: invitation management ────────────────────────────────────────────

  test.describe('invitation API', () => {
    test('invalid email format returns 400', async ({ request, baseURL }) => {
      const { session_id: adminSid } = await demoLoginSessionId(baseURL!, 'admin')
      const res = await request.post('/api/organization/invitations', {
        headers: { 'x-session-id': adminSid },
        data: { email: 'not-an-email' },
      })
      expect(res.status()).toBe(400)
    })

    test('inviting an existing member returns 409', async ({ request, baseURL }) => {
      const { session_id: adminSid } = await demoLoginSessionId(baseURL!, 'admin')
      const { primary_email: demoUserEmail } = await demoLoginSessionId(baseURL!, 'user')
      const res = await request.post('/api/organization/invitations', {
        headers: { 'x-session-id': adminSid },
        data: { email: demoUserEmail },
      })
      expect(res.status()).toBe(409)
    })

    test('duplicate pending invitation returns 409', async ({ request, baseURL }) => {
      const { session_id: adminSid } = await demoLoginSessionId(baseURL!, 'admin')
      const email = `dup-${Date.now()}@nowhere.invalid`
      await request.post('/api/organization/invitations', {
        headers: { 'x-session-id': adminSid },
        data: { email },
      })
      const res = await request.post('/api/organization/invitations', {
        headers: { 'x-session-id': adminSid },
        data: { email },
      })
      expect(res.status()).toBe(409)
    })

    test('member (no user:manage) cannot create an invitation — 403', async ({ request, baseURL }) => {
      const { session_id: userSid } = await demoLoginSessionId(baseURL!, 'user')
      const res = await request.post('/api/organization/invitations', {
        headers: { 'x-session-id': userSid },
        data: { email: 'newinvite@test.invalid' },
      })
      expect(res.status()).toBe(403)
    })

    test('revoke removes the invitation (B5: server-confirm via re-fetch)', async ({ request, baseURL }) => {
      const { session_id: adminSid } = await demoLoginSessionId(baseURL!, 'admin')
      const email = `revoke-${Date.now()}@nowhere.invalid`

      const inv = await (await request.post('/api/organization/invitations', {
        headers: { 'x-session-id': adminSid },
        data: { email },
      })).json()

      await request.delete(`/api/organization/invitations/${inv.id}`, {
        headers: { 'x-session-id': adminSid },
      })

      const list = await (await request.get('/api/organization/invitations', {
        headers: { 'x-session-id': adminSid },
      })).json()
      expect(list.some((i: { email: string }) => i.email === email)).toBe(false)
    })

    test('accepting a non-existent token returns 404', async ({ request, baseURL }) => {
      const { session_id: adminSid } = await demoLoginSessionId(baseURL!, 'admin')
      const res = await request.post('/api/invitations/nonexistent-token-xyz/accept', {
        headers: { 'x-session-id': adminSid },
      })
      expect(res.status()).toBe(404)
    })

    test('B1 (fixed): accept rejects a user whose email does not match the invite', async ({ request, baseURL }) => {
      const { session_id: adminSid, primary_email: adminEmail } = await demoLoginSessionId(baseURL!, 'admin')
      // Create an invitation for alice; admin's email differs from alice's
      const invRes = await request.post('/api/organization/invitations', {
        headers: { 'x-session-id': adminSid },
        data: { email: ALICE_EMAIL },
      })
      expect(invRes.ok()).toBe(true)
      const { token } = await invRes.json()

      // Admin tries to accept alice's invite — emails differ → must be 403
      expect(adminEmail).not.toBe(ALICE_EMAIL)
      const res = await request.post(`/api/invitations/${token}/accept`, {
        headers: { 'x-session-id': adminSid },
      })
      expect(res.status()).toBe(403)
    })
  })
})
