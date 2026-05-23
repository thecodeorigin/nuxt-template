import { expect, test } from '@nuxt/test-utils/playwright'
import { ALICE_EMAIL, BOB_EMAIL, demoLoginSessionId, devCleanup, devLogin, devSeed, FORBIDDEN_URL, setCookieSession } from './helpers/auth'

const SEED_EMAILS = ['admin@seed.local', ALICE_EMAIL, BOB_EMAIL]
const DEMO_ADMIN_EMAIL = 'admin@demo.local'

test.describe('impersonation', () => {
  test.beforeAll(async ({ request }) => {
    await devSeed(request)
  })

  test.afterAll(async ({ request }) => {
    await devCleanup(request, SEED_EMAILS)
  })

  test.beforeEach(async ({ context }) => {
    await context.clearCookies()
  })

  test('non-admin is redirected to /forbidden when visiting the sandbox', async ({ page, context, baseURL }) => {
    const { session_id } = await devLogin(baseURL!, BOB_EMAIL)
    await setCookieSession(context, baseURL!, session_id)
    await page.goto('/sandbox/impersonate')
    await expect(page).toHaveURL(FORBIDDEN_URL)
  })

  test('admin can impersonate alice; session swaps server-side', async ({ page, context, request, baseURL, goto }) => {
    const { session_id } = await demoLoginSessionId(baseURL!, 'admin')
    await setCookieSession(context, baseURL!, session_id)

    await goto('/sandbox/impersonate', { waitUntil: 'hydration' })
    await expect(page.getByRole('heading', { name: 'Impersonation sandbox' })).toBeVisible()
    await expect(page.getByTestId('current-user-name')).toContainText('Admin Agent')

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
    expect(me.impersonator?.primary_email).toBe(DEMO_ADMIN_EMAIL)
  })

  test('redirection block: after impersonating bob, the sandbox redirects to /forbidden on revisit', async ({ page, context, request, baseURL }) => {
    const { session_id } = await demoLoginSessionId(baseURL!, 'admin')
    await setCookieSession(context, baseURL!, session_id)

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
    const { session_id } = await demoLoginSessionId(baseURL!, 'admin')
    const { user_id: aliceId } = await devLogin(baseURL!, ALICE_EMAIL)

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
    expect(me.primary_email).toBe(DEMO_ADMIN_EMAIL)
    expect(me.impersonator).toBeNull()
  })

  test('cannot start impersonation while already impersonating', async ({ request, baseURL }) => {
    const { session_id } = await demoLoginSessionId(baseURL!, 'admin')
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
    // After step 1 the session in KV is alice (impersonating). The
    // authorization check fires first and rejects with 403 because alice
    // doesn't have user:impersonate. We never reach the explicit
    // "already impersonating" 400 — and that's the correct security
    // model: while impersonating, you ARE that user.
    expect(start2.status()).toBe(403)
  })

  test('cannot self-impersonate', async ({ request, baseURL }) => {
    const { session_id, user_id } = await demoLoginSessionId(baseURL!, 'admin')
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
