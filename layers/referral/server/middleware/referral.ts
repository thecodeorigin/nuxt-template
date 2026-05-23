import { getCookie, getQuery, setCookie } from 'h3'
import { REF_CODE_RE } from '#layers/referral/server/services/referral'

export default defineEventHandler((event) => {
  const path = event.path || ''
  if (path.startsWith('/api/') || path.startsWith('/_nuxt') || path.startsWith('/images/'))
    return
  const ref = getQuery(event).ref
  if (typeof ref !== 'string' || !REF_CODE_RE.test(ref))
    return
  if (getCookie(event, 'ref'))
    return
  setCookie(event, 'ref', ref, {
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
})
