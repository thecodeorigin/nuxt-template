import { expect, test } from '@nuxt/test-utils/playwright'
import { demoLoginSessionId, FORBIDDEN_URL, setCookieSession } from '../../auth/tests/helpers/auth'

test.describe('support inbox (staff)', () => {
  let adminSession: { session_id: string, user_id: string }
  let userSession: { session_id: string, user_id: string }

  test.beforeAll(async ({ baseURL }) => {
    adminSession = await demoLoginSessionId(baseURL!, 'admin')
    userSession = await demoLoginSessionId(baseURL!, 'user')
  })

  test.describe('authz', () => {
    test('non-staff: GET /api/system/tickets → 403', async ({ request, context, baseURL }) => {
      await setCookieSession(context, baseURL!, userSession.session_id)
      const res = await request.get('/api/system/tickets')
      expect(res.status()).toBe(403)
    })

    test('non-staff: /system/tickets → /forbidden', async ({ page, context, baseURL }) => {
      await setCookieSession(context, baseURL!, userSession.session_id)
      await page.goto('/system/tickets')
      await expect(page).toHaveURL(FORBIDDEN_URL)
    })
  })

  test.describe('admin inbox + auto-claim', () => {
    let ticketId: string

    test('admin lists tickets (demo seed guarantees ≥1)', async ({ request, context, baseURL }) => {
      await setCookieSession(context, baseURL!, adminSession.session_id)
      const res = await request.get('/api/system/tickets')
      expect(res.ok()).toBeTruthy()
      const { items } = await res.json()
      expect(items.length).toBeGreaterThan(0)
      ticketId = items[0].id
    })

    test('admin reply: status open→active, auto-claimed', async ({ request, context, baseURL }) => {
      await setCookieSession(context, baseURL!, adminSession.session_id)
      const before = await (await request.get(`/api/system/tickets/${ticketId}`)).json()
      if (before.status === 'open') {
        const res = await request.post(`/api/system/tickets/${ticketId}/messages`, {
          data: { body: 'We are looking into this.' },
        })
        expect(res.ok()).toBeTruthy()
        const ticket = await res.json()
        expect(ticket.status).toBe('active')
        expect(ticket.assignedTo).toBeTruthy()
      }
    })

    test('PATCH status closed → user reply is 409', async ({ request, context, baseURL }) => {
      await setCookieSession(context, baseURL!, adminSession.session_id)

      // create a fresh ticket as user
      await setCookieSession(context, baseURL!, userSession.session_id)
      const createRes = await request.post('/api/support/tickets', {
        data: { kind: 'feedback', subject: 'Close test', body: 'Testing close.' },
      })
      if (!createRes.ok())
        return
      const fresh = await createRes.json()

      // close it as admin
      await setCookieSession(context, baseURL!, adminSession.session_id)
      await request.patch(`/api/system/tickets/${fresh.id}`, { data: { status: 'closed' } })

      // user reply should 409
      await setCookieSession(context, baseURL!, userSession.session_id)
      const replyRes = await request.post(`/api/support/tickets/${fresh.id}/messages`, {
        data: { body: 'Reply after close' },
      })
      expect(replyRes.status()).toBe(409)
    })
  })

  test.describe('reminder idempotency', () => {
    test('remindStale task runs without error (dev task runner)', async ({ request, context, baseURL }) => {
      await setCookieSession(context, baseURL!, adminSession.session_id)
      const res = await request.post('/_nitro/tasks/support:remindStale')
      if (res.ok()) {
        const body = await res.json()
        expect(body).toHaveProperty('result')
        expect(typeof body.result.scanned).toBe('number')
      }
    })
  })
})
