import { expect, test } from '@nuxt/test-utils/playwright'
import { demoLoginSessionId, devCleanup, devProvision, uniqueEmail } from '../../auth/tests/helpers/auth'

test.describe('todo CRUD — per-role smoke', () => {
  const emails: string[] = []

  test.afterAll(async ({ request }) => {
    await devCleanup(request, emails)
  })

  test('member (todo:write) can create a todo', async ({ request, baseURL }) => {
    const { session_id } = await demoLoginSessionId(baseURL!, 'user')
    const res = await request.post('/api/todos', {
      headers: { 'x-session-id': session_id },
      data: { title: 'Member todo' },
    })
    expect(res.ok()).toBe(true)
    const todo = await res.json()
    expect(todo.title).toBe('Member todo')
  })

  test('guest (todo:read only) cannot create a todo — 403', async ({ request, baseURL }) => {
    const { session_id: adminSid } = await demoLoginSessionId(baseURL!, 'admin')
    const { session_id: userSid, user_id: userId } = await demoLoginSessionId(baseURL!, 'user')

    // Demote user to guest — :self abilities preserved by handler
    await request.patch(`/api/organization/members/${userId}/abilities`, {
      headers: { 'x-session-id': adminSid },
      data: { abilities: ['todo:read'] },
    })

    try {
      const res = await request.post('/api/todos', {
        headers: { 'x-session-id': userSid },
        data: { title: 'Should be blocked' },
      })
      expect(res.status()).toBe(403)
    }
    finally {
      // Restore member abilities regardless of assertion outcome
      await request.patch(`/api/organization/members/${userId}/abilities`, {
        headers: { 'x-session-id': adminSid },
        data: { abilities: ['user:read', 'todo:read', 'todo:write'] },
      })
    }
  })

  test('member with todo:delete:self can delete a todo', async ({ request, baseURL }) => {
    const { session_id: adminSid } = await demoLoginSessionId(baseURL!, 'admin')
    const { user_id: userId } = await demoLoginSessionId(baseURL!, 'user')

    // abilities.patch.ts always injects SELF_ABILITY_KEYS — ensure the session
    // is fresh after any prior test may have stripped :self from the KV session.
    await request.patch(`/api/organization/members/${userId}/abilities`, {
      headers: { 'x-session-id': adminSid },
      data: { abilities: ['user:read', 'todo:read', 'todo:write'] },
    })
    // Re-fetch so the session carries the refreshed ability set
    const { session_id: freshUserSid } = await demoLoginSessionId(baseURL!, 'user')

    // User creates their OWN todo — :self enforces ownership via defineSubject
    const created = await (await request.post('/api/todos', {
      headers: { 'x-session-id': freshUserSid },
      data: { title: 'To be deleted' },
    })).json()

    const res = await request.delete(`/api/todos/${created.id}`, {
      headers: { 'x-session-id': freshUserSid },
    })
    expect(res.ok()).toBe(true)
  })

  test('provisioned personal-org owner can create and read todos', async ({ request, baseURL }) => {
    const email = uniqueEmail('todo-owner')
    const { session_id, personal_org_id } = await devProvision(baseURL!, email, 'Todo Owner')
    emails.push(email)

    expect(personal_org_id).toBeTruthy()

    const created = await (await request.post('/api/todos', {
      headers: { 'x-session-id': session_id },
      data: { title: 'Owner todo' },
    })).json()
    expect(created.title).toBe('Owner todo')

    const list = await (await request.get('/api/todos', {
      headers: { 'x-session-id': session_id },
    })).json()
    expect(list.some((t: { id: string }) => t.id === created.id)).toBe(true)
  })
})
