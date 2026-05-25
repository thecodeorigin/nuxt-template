import { expect, test } from '@nuxt/test-utils/playwright'
import { demoLoginSessionId, setCookieSession } from '../../auth/tests/helpers/auth'

test.describe('support user API', () => {
  let adminSession: { session_id: string, user_id: string }
  let userSession: { session_id: string, user_id: string }
  let ticketId: string

  test.beforeAll(async ({ baseURL }) => {
    adminSession = await demoLoginSessionId(baseURL!, 'admin')
    userSession = await demoLoginSessionId(baseURL!, 'user')
  })

  test('user can create a support ticket', async ({ request, context, baseURL }) => {
    await setCookieSession(context, baseURL!, userSession.session_id)
    const res = await request.post('/api/support/tickets', {
      data: { kind: 'support', category: 'technical', subject: 'Export fails', body: 'Details here.' },
    })
    expect(res.ok()).toBeTruthy()
    const ticket = await res.json()
    expect(ticket.status).toBe('open')
    expect(ticket.messages).toHaveLength(1)
    expect(ticket.messages[0].body).toBe('Details here.')
    ticketId = ticket.id
  })

  test('GET /api/support/tickets lists the new ticket', async ({ request, context, baseURL }) => {
    await setCookieSession(context, baseURL!, userSession.session_id)
    const res = await request.get('/api/support/tickets')
    expect(res.ok()).toBeTruthy()
    const { items } = await res.json()
    expect(items.some((t: any) => t.id === ticketId)).toBe(true)
  })

  test('GET /api/support/tickets/:id shows the ticket with message', async ({ request, context, baseURL }) => {
    await setCookieSession(context, baseURL!, userSession.session_id)
    const res = await request.get(`/api/support/tickets/${ticketId}`)
    expect(res.ok()).toBeTruthy()
    const ticket = await res.json()
    expect(ticket.messages[0].body).toBe('Details here.')
  })

  test('another user cannot read the ticket (404)', async ({ request, context, baseURL }) => {
    await setCookieSession(context, baseURL!, adminSession.session_id)
    const res = await request.get(`/api/support/tickets/${ticketId}`)
    expect(res.status()).toBe(404)
  })

  test('ticket is still visible after context cleared (ownership, not org)', async ({ request, context, baseURL }) => {
    await setCookieSession(context, baseURL!, userSession.session_id)
    const res = await request.get('/api/support/tickets')
    const { items } = await res.json()
    expect(items.some((t: any) => t.id === ticketId)).toBe(true)
  })
})
