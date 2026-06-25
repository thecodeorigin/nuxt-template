import type { OidcUser } from '@nuxthub/db/schema'
import { ActivityAction, activityTable, identityTable, userTable } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { persistSession } from '#layers/auth/server/services/session'

interface OidcTokenResponse {
  access_token: string
  token_type: string
  expires_in?: number
  id_token?: string
  refresh_token?: string
  scope?: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const issuer = config.thecodeoriginIssuer
  const query = getQuery(event)

  // Provider-side error (consent denied / IdP error) → back to login, not a 500.
  if (query.error) {
    return sendRedirect(event, `/auth/login?error=${encodeURIComponent(String(query.error))}`)
  }

  const code = query.code as string | undefined
  const state = query.state as string | undefined
  const storedState = getCookie(event, 'oidc_oauth_state')
  const codeVerifier = getCookie(event, 'oidc_pkce_verifier')

  if (!code || !state || state !== storedState || !codeVerifier) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid state or code' })
  }

  deleteCookie(event, 'oidc_oauth_state', { path: '/api/auth' })
  deleteCookie(event, 'oidc_pkce_verifier', { path: '/api/auth' })

  const redirectUri = `${getBaseUrl(event)}/api/auth/oidc/callback`

  // Exchange code → tokens. Confidential client: client_secret_basic + PKCE verifier.
  let tokens: OidcTokenResponse
  try {
    tokens = await $fetch<OidcTokenResponse>(`${issuer}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${encodeBase64(`${config.thecodeoriginClientId}:${config.thecodeoriginClientSecret}`)}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }).toString(),
    })
  }
  catch (err) {
    console.error('[auth] oidc token exchange failed', err)
    return sendRedirect(event, '/auth/login?error=token_exchange_failed')
  }

  if (!tokens.access_token) {
    return sendRedirect(event, '/auth/login?error=token_exchange_failed')
  }

  // Claims from userinfo (trusted server-to-server TLS call).
  let userinfo: OidcUser
  try {
    userinfo = await $fetch<OidcUser>(`${issuer}/oauth2/userinfo`, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
  }
  catch (err) {
    console.error('[auth] oidc userinfo failed', err)
    return sendRedirect(event, '/auth/login?error=userinfo_failed')
  }

  // Account-hijack guard: never link/create on an unverified email.
  const emailVerified = userinfo.email_verified === true || userinfo.email_verified === 'true'
  if (!userinfo.sub || !userinfo.email || !emailVerified) {
    throw createError({ statusCode: 400, statusMessage: 'Identity provider did not return a verified email' })
  }

  const email = userinfo.email
  const now = new Date()

  // Upsert user by primary_email (mirrors the Google/GitHub callbacks).
  let user = await db.query.userTable.findFirst({ where: eq(userTable.primary_email, email) })

  if (!user) {
    const [newUser] = await db.insert(userTable).values({
      primary_email: email,
      name: userinfo.name,
      avatar: userinfo.picture,
      username: email.split('@')[0],
      last_sign_in_at: now,
    }).returning()
    user = newUser!

    await db.insert(activityTable).values({ user_id: user.id, action: ActivityAction.SIGN_UP })
    await (useNitroApp().hooks as { callHook: (event: string, ...args: unknown[]) => Promise<void> })
      .callHook('auth:user-created', { user, provider: 'thecodeorigin', event })
  }
  else {
    const [updatedUser] = await db.update(userTable)
      .set({
        name: userinfo.name || user.name,
        avatar: userinfo.picture || user.avatar,
        last_sign_in_at: now,
        updated_at: now,
      })
      .where(eq(userTable.id, user.id))
      .returning()
    user = updatedUser!
  }

  // Upsert identity by (provider, provider_user_id = sub).
  const existingIdentity = await db.query.identityTable.findFirst({
    where: and(
      eq(identityTable.provider, 'thecodeorigin'),
      eq(identityTable.provider_user_id, userinfo.sub),
    ),
  })

  if (!existingIdentity) {
    await db.insert(identityTable).values({
      user_id: user.id,
      provider: 'thecodeorigin',
      provider_user_id: userinfo.sub,
      provider_data: userinfo,
    })
  }
  else {
    await db.update(identityTable)
      .set({ provider_data: userinfo, updated_at: now })
      .where(eq(identityTable.id, existingIdentity.id))
  }

  await persistSession(event, user, {
    provider: 'thecodeorigin',
    idpClaims: {
      org: userinfo.org ?? null,
      roles: userinfo.roles ?? null,
      personal: userinfo.personal ?? false,
      entitlement: userinfo.entitlement ?? null,
    },
  })
  await db.insert(activityTable).values({ user_id: user.id, action: ActivityAction.SIGN_IN })

  return sendRedirect(event, '/dashboard')
})
