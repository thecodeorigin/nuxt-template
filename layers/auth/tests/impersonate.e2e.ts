import type { APIRequestContext } from '@playwright/test'
import { expect, test } from '@nuxt/test-utils/playwright'
import { request as apiRequest } from '@playwright/test'
import { SEED_USERS } from '../server/services/seed'

const ADMIN_EMAIL = 'admin@seed.local'
const ALICE_EMAIL = 'alice@seed.local'
const BOB_EMAIL = 'bob@seed.local'
const FORBIDDEN_URL = /\/forbidden$/

const issuedSessionIds = new Set<string>()

async function devSeed(request: APIRequestContext) {
  const res = await request.post('/api/auth/dev-seed')
  expect(res.ok()).toBeTruthy()
  return res.json() as Promise<{ users: Array<{ id: string, primary_email: string }> }>
}

// Each devLogin runs in a throwaway request context so the Set-Cookie
// it returns doesn't pollute the caller's cookie jar. Otherwise the
// most-recent login's `sessionid` cookie ends up overriding any
// `x-session-id` header on subsequent requests, since the auth handler
// reads the cookie first.
async function devLogin(baseURL: string, email: string) {
  const ctx = await apiRequest.newContext({ baseURL })
  const res = await ctx.post('/api/auth/dev-login', { data: { email } })
  expect(res.ok()).toBeTruthy()
  const body = (await res.json()) as { session_id: string, user_id: string }
  issuedSessionIds.add(body.session_id)
  await ctx.dispose()
  return body
}

async function devCleanup(request: APIRequestContext) {
  await request.post('/api/auth/dev-cleanup', {
    data: {
      emails: SEED_USERS.map(u => u.primary_email),
      session_ids: Array.from(issuedSessionIds),
    },
  })
  issuedSessionIds.clear()
}

test.describe('impersonation', () => {
  test.beforeAll(async ({ request }) => {
    await devSeed(request)
  })

  test.afterAll(async ({ request }) => {
    await devCleanup(request)
  })

  test.beforeEach(async ({ context }) => {
    await context.clearCookies()
  })

  test('non-admin is redirected to /forbidden when visiting the sandbox', async ({ page, context, baseURL }) => {
    const { session_id } = await devLogin(baseURL!, BOB_EMAIL)
    await context.addCookies([{
      name: 'sessionid',
      value: session_id,
      url: baseURL!,
      httpOnly: true,
      sameSite: 'Lax',
    }])

    await page.goto('/sandbox/impersonate')
    await expect(page).toHaveURL(FORBIDDEN_URL)
  })

  test('admin can impersonate alice; session swaps server-side', async ({ page, context, request, baseURL, goto }) => {
    const { session_id } = await devLogin(baseURL!, ADMIN_EMAIL)
    await context.addCookies([{
      name: 'sessionid',
      value: session_id,
      url: baseURL!,
      httpOnly: true,
      sameSite: 'Lax',
    }])

    await goto('/sandbox/impersonate', { waitUntil: 'hydration' })
    await expect(page.getByRole('heading', { name: 'Impersonation sandbox' })).toBeVisible()
    await expect(page.getByTestId('current-user-name')).toContainText('Seed Admin')

    await page.getByTestId(`impersonate-${ALICE_EMAIL}`).click()

    // Component triggers window.location.reload() — wait for navigation to settle
    await page.waitForLoadState('networkidle')

    // Alice doesn't have user:impersonate, so /sandbox/impersonate redirects to /forbidden
    await expect(page).toHaveURL(FORBIDDEN_URL)

    // Server-side: /api/auth/me should now return alice with impersonator info
    const meRes = await request.get('/api/auth/me', {
      headers: { 'x-session-id': session_id },
    })
    const me = (await meRes.json()) as { id: string, primary_email: string, impersonator: { primary_email: string } | null }
    expect(me.primary_email).toBe(ALICE_EMAIL)
    expect(me.impersonator?.primary_email).toBe(ADMIN_EMAIL)
  })

  test('redirection block: after impersonating bob, the sandbox redirects to /forbidden on revisit', async ({ page, context, request, baseURL }) => {
    const { session_id } = await devLogin(baseURL!, ADMIN_EMAIL)
    await context.addCookies([{
      name: 'sessionid',
      value: session_id,
      url: baseURL!,
      httpOnly: true,
      sameSite: 'Lax',
    }])

    // Impersonate via direct API (faster than UI click + reload)
    const { user_id: bobId } = await devLogin(baseURL!, BOB_EMAIL)
    const startRes = await request.post('/api/auth/impersonate/start', {
      headers: { 'x-session-id': session_id },
      data: { user_id: bobId },
    })
    expect(startRes.ok()).toBeTruthy()

    // Bob has no user:impersonate, so casl middleware redirects.
    await page.goto('/sandbox/impersonate')
    await expect(page).toHaveURL(FORBIDDEN_URL)
  })

  test('stop impersonation restores admin session via API', async ({ request, baseURL }) => {
    const { session_id, user_id: adminId } = await devLogin(baseURL!, ADMIN_EMAIL)
    const { user_id: aliceId } = await devLogin(baseURL!, ALICE_EMAIL)
    void adminId

    const startRes = await request.post('/api/auth/impersonate/start', {
      headers: { 'x-session-id': session_id },
      data: { user_id: aliceId },
    })
    expect(startRes.ok()).toBeTruthy()

    const stopRes = await request.post('/api/auth/impersonate/stop', {
      headers: { 'x-session-id': session_id },
    })
    expect(stopRes.ok()).toBeTruthy()

    const meRes = await request.get('/api/auth/me', {
      headers: { 'x-session-id': session_id },
    })
    const me = (await meRes.json()) as { primary_email: string, impersonator: unknown }
    expect(me.primary_email).toBe(ADMIN_EMAIL)
    expect(me.impersonator).toBeNull()
  })

  test('cannot start impersonation while already impersonating', async ({ request, baseURL }) => {
    const { session_id } = await devLogin(baseURL!, ADMIN_EMAIL)
    const { user_id: aliceId } = await devLogin(baseURL!, ALICE_EMAIL)

    const start1 = await request.post('/api/auth/impersonate/start', {
      headers: { 'x-session-id': session_id },
      data: { user_id: aliceId },
    })
    expect(start1.ok()).toBeTruthy()

    const start2 = await request.post('/api/auth/impersonate/start', {
      headers: { 'x-session-id': session_id },
      data: { user_id: aliceId },
    })
    // After step 1 the session in Redis is alice (impersonating). The
    // authorization check fires first and rejects with 403 because alice
    // doesn't have user:impersonate. We never reach the explicit
    // "already impersonating" 400 — and that's the correct security
    // model: while impersonating, you ARE that user.
    expect(start2.status()).toBe(403)
  })

  test('cannot self-impersonate', async ({ request, baseURL }) => {
    const { session_id, user_id } = await devLogin(baseURL!, ADMIN_EMAIL)
    const res = await request.post('/api/auth/impersonate/start', {
      headers: { 'x-session-id': session_id },
      data: { user_id },
    })
    expect(res.status()).toBe(400)
  })

  test('non-admin server call to /api/auth/impersonate/start returns 403', async ({ request, baseURL }) => {
    const { session_id } = await devLogin(baseURL!, BOB_EMAIL)
    const { user_id: aliceId } = await devLogin(baseURL!, ALICE_EMAIL)

    const res = await request.post('/api/auth/impersonate/start', {
      headers: { 'x-session-id': session_id },
      data: { user_id: aliceId },
    })
    expect(res.status()).toBe(403)
  })
})
