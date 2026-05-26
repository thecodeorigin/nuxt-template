import { withQuery } from 'ufo'
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

  return sendRedirect(event, withQuery('https://github.com/login/oauth/authorize', {
    client_id: runtimeConfig.githubClientId,
    redirect_uri: `${getBaseUrl(event)}/api/auth/github/callback`,
    scope: 'user:email',
    state,
  }))
})
