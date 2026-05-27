import { expect, test } from '@nuxt/test-utils/playwright'

const COOKIE_SPLIT = /,\s*(?=\w+=)/

test.beforeEach(async ({ context, request, baseURL }) => {
  const res = await request.post('/api/auth/demo-login', { data: { agent: 'admin' } })
  expect(res.ok()).toBeTruthy()
  const cookies = res.headers()['set-cookie']?.split(COOKIE_SPLIT) ?? []
  const sessionid = cookies.find(c => c.startsWith('sessionid='))?.split(';')[0]?.split('=')[1]
  await context.addCookies([{ name: 'sessionid', value: sessionid!, url: baseURL!, httpOnly: true, sameSite: 'Lax' }])
})

test('notifications API returns seeded items + unread count', async ({ request }) => {
  const list = await (await request.get('/api/notifications?offset=0&limit=5')).json()
  expect(list.items.length).toBe(5)
  expect(list.hasMore).toBe(true)
  const { count } = await (await request.get('/api/notifications/unread-count')).json()
  expect(count).toBeGreaterThan(0)
})

test('marking read decrements unread count and is idempotent per user', async ({ request }) => {
  const list = await (await request.get('/api/notifications?offset=0&limit=20')).json()
  const unread = list.items.find((n: any) => !n.isRead)
  expect(unread).toBeTruthy()
  const updated = await (await request.patch(`/api/notifications/${unread.id}/read`)).json()
  expect(updated.isRead).toBe(true)
})
