import { withQuery } from 'ufo'
import { simplifyNanoId } from '~~/shared/utils/id'

// RFC 7636 S256 challenge = BASE64URL(SHA-256(ASCII(code_verifier))).
// btoa()/Buffer produce *standard* base64 — must url-encode + strip padding,
// or the IdP (requirePKCE) rejects the verifier at token exchange.
function toBase64Url(bytes: ArrayBuffer): string {
  const b64 = btoa(String.fromCharCode(...new Uint8Array(bytes)))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const issuer = config.thecodeoriginIssuer
  if (!issuer || !config.thecodeoriginClientId || !config.thecodeoriginClientSecret) {
    throw createError({ statusCode: 404, statusMessage: 'THECODEORIGIN sign-in is not configured' })
  }

  const state = simplifyNanoId(32)
  // RFC 7636 §4.1: 43–128 chars from the unreserved set. simplifyNanoId's
  // alphabet (0-9a-z) is unreserved-safe; 64 chars sits well inside the range.
  const codeVerifier = simplifyNanoId(64)
  const codeChallenge = toBase64Url(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier)),
  )

  const cookieOpts = {
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: 'lax' as const,
    maxAge: 60 * 10, // 10 minutes
    path: '/api/auth',
  }
  setCookie(event, 'oidc_oauth_state', state, cookieOpts)
  setCookie(event, 'oidc_pkce_verifier', codeVerifier, cookieOpts)

  return sendRedirect(event, withQuery(`${issuer}/oauth2/authorize`, {
    client_id: config.thecodeoriginClientId,
    redirect_uri: `${getBaseUrl(event)}/api/auth/oidc/callback`,
    response_type: 'code',
    scope: 'openid profile email',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  }))
})
