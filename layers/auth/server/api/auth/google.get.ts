import { withQuery } from 'ufo'
import { simplifyNanoId } from '~~/shared/utils/id'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const state = simplifyNanoId()

  setCookie(event, 'google_oauth_state', state, {
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/api/auth',
  })

  return sendRedirect(event, withQuery('https://accounts.google.com/o/oauth2/v2/auth', {
    client_id: runtimeConfig.googleClientId,
    redirect_uri: `${getBaseUrl(event)}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'email profile openid',
    state,
    access_type: 'offline',
    prompt: 'consent',
  }))
})
