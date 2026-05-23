import { expect, test } from '@nuxt/test-utils/playwright'
import { demoLoginSessionId, devCleanup, devProvision, setCookieSession, uniqueEmail } from './helpers/auth'

const LOGIN_URL = /\/auth\/login/
const DASHBOARD_URL = /\/dashboard/
const FORBIDDEN_URL = /\/forbidden/

const emails: string[] = []

test.afterAll(async ({ request }) => {
  await devCleanup(request, emails)
})

test.describe('route guards (UI)', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies()
  })

  test('anonymous visiting a protected page is redirected to /auth/login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(LOGIN_URL)
  })

  test('authenticated user on the login page is redirected to /dashboard', async ({ page, context, baseURL }) => {
    const email = uniqueEmail('guard')
    const { session_id } = await devProvision(baseURL!, email, 'Guard User')
    emails.push(email)
    await setCookieSession(context, baseURL!, session_id)
    await page.goto('/auth/login')
    await expect(page).toHaveURL(DASHBOARD_URL)
  })

  test('user without user:impersonate is redirected to /forbidden from the sandbox', async ({ page, context, baseURL }) => {
    const email = uniqueEmail('guard')
    const { session_id } = await devProvision(baseURL!, email, 'Guard User')
    emails.push(email)
    await setCookieSession(context, baseURL!, session_id)
    await page.goto('/sandbox/impersonate')
    await expect(page).toHaveURL(FORBIDDEN_URL)
  })
})

test.describe('session lifecycle (API)', () => {
  test('new provisioned user has personal org as active and default abilities', async ({ request, baseURL }) => {
    const email = uniqueEmail('onboard')
    const { session_id, personal_org_id } = await devProvision(baseURL!, email, 'Onboard User')
    emails.push(email)
    const me = await (await request.get('/api/auth/me', { headers: { 'x-session-id': session_id } })).json()
    expect(me.primary_email).toBe(email)
    expect(me.activeOrganizationId).toBe(personal_org_id)
    expect(me.abilities).toEqual(expect.arrayContaining(['user:manage', 'todo:manage', 'billing:manage', 'billing:read']))
  })

  test('request to a protected API without a valid session returns 401', async ({ request }) => {
    const res = await request.get('/api/organization/members', { headers: { 'x-session-id': 'not-a-real-session' } })
    expect(res.status()).toBe(401)
  })

  test('logout clears the KV session', async ({ request, baseURL }) => {
    const email = uniqueEmail('logout')
    const { session_id } = await devProvision(baseURL!, email, 'Logout User')
    emails.push(email)
    expect((await request.get('/api/auth/me', { headers: { 'x-session-id': session_id } })).ok()).toBe(true)
    await request.get('/api/auth/logout', { headers: { 'x-session-id': session_id } })
    expect((await request.get('/api/auth/me', { headers: { 'x-session-id': session_id } })).status()).toBe(401)
  })

  test('demo admin has user:impersonate ability', async ({ request, baseURL }) => {
    const { session_id } = await demoLoginSessionId(baseURL!, 'admin')
    const me = await (await request.get('/api/auth/me', { headers: { 'x-session-id': session_id } })).json()
    expect(me.abilities).toContain('user:impersonate')
  })

  test('demo user (member) has todo:read but not user:manage', async ({ request, baseURL }) => {
    const { session_id } = await demoLoginSessionId(baseURL!, 'user')
    const me = await (await request.get('/api/auth/me', { headers: { 'x-session-id': session_id } })).json()
    expect(me.abilities).toContain('todo:read')
    expect(me.abilities).not.toContain('user:manage')
  })
})
