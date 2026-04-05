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

  const redirectUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
  const params = new URLSearchParams({
    client_id: runtimeConfig.googleClientId as string,
    redirect_uri: `${getBaseUrl()}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'email profile openid',
    state,
    access_type: 'offline',
    prompt: 'consent',
  })

  return sendRedirect(event, `${redirectUrl}?${params.toString()}`)
})
