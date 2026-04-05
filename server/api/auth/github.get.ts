import { simplifyNanoId } from '~~/shared/utils/id'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const state = simplifyNanoId()

  setCookie(event, 'github_oauth_state', state, {
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/api/auth',
  })

  const redirectUrl = 'https://github.com/login/oauth/authorize'
  const params = new URLSearchParams({
    client_id: runtimeConfig.githubClientId as string,
    redirect_uri: `${getBaseUrl()}/api/auth/github/callback`,
    scope: 'user:email',
    state,
  })

  return sendRedirect(event, `${redirectUrl}?${params.toString()}`)
})
