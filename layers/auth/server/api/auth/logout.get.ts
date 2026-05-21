import { kv } from '@nuxthub/kv'

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'sessionid') || getHeader(event, 'x-session-id')

  if (sessionId) {
    await kv.del(`session:${sessionId}`)
  }

  deleteCookie(event, 'sessionid', {
    path: '/dashboard',
    secure: !import.meta.dev,
    sameSite: 'lax',
  })

  return { success: true }
})
