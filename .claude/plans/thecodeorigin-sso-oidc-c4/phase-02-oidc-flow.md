# Phase 02 — OIDC flow: routes, schema, env, config

All paths in `D:\projects\nuxt-template`. This phase adds the working
flow; Phase 03 removes Google/GitHub and swaps the UI.

> **Env var naming (locked by the user):** the three config values are
> `NUXT_THECODEORIGIN_ISSUER`, `NUXT_THECODEORIGIN_CLIENT_ID`,
> `NUXT_THECODEORIGIN_CLIENT_SECRET`. They map to runtimeConfig keys
> `thecodeoriginIssuer`, `thecodeoriginClientId`,
> `thecodeoriginClientSecret` (Nuxt auto-maps `NUXT_FOO_BAR` →
> `fooBar`).
>
> The user has already added `CLIENT_ID` + `CLIENT_SECRET` to `.env`
> (local dev) and `.env.production` (prod, `template.thecodeorigin.com`).
> **Still TODO:** add `NUXT_THECODEORIGIN_ISSUER=https://auth.thecodeorigin.com/api/auth`
> to **both** files (Step 2.3).

---

## Step 2.1 — Schema: add the provider literal + `OidcUser` type

`layers/auth/server/db/schema.ts`

The `provider` column is plain `text` (no DB CHECK — verified in the
generated migration), so this is **TypeScript-only**; no SQL migration is
produced. Add the enum member and an `OidcUser` interface, and extend the
`provider_data` `$type` union.

Add `OidcUser` near the other provider interfaces (after `GitHubUser`, ~line 29):

```ts
// better-auth OIDC userinfo payload (sub/email/name/picture) + the IdP's
// custom claims (org/roles/personal/entitlement). All optional except sub —
// the callback validates email + email_verified before use.
export interface OidcUser {
  sub: string
  email?: string
  email_verified?: boolean | string
  name?: string
  picture?: string
  org?: string | null
  roles?: string | null
  personal?: boolean
  entitlement?: string | null
}
```

Add the enum member:

```ts
export enum AuthProvider {
  GOOGLE = 'google',
  GITHUB = 'github',
  THECODEORIGIN = 'thecodeorigin',
}
```

Extend the `provider_data` column type (~line 80):

```ts
  provider_data: text('provider_data', { mode: 'json' }).$type<GoogleUser | GitHubUser | OidcUser>(),
```

> Do **not** remove `GOOGLE`/`GITHUB` — historical rows and other tests
> reference them; they're harmless type literals (see plan open Q3).

After this edit, run `pnpm exec nuxi db generate` and confirm **no new
migration file** is produced (the only change is TS typing).

---

## Step 2.2 — runtimeConfig: add THECODEORIGIN keys

`nuxt.config.ts` — in `runtimeConfig` (alongside the existing
`googleClientId` block, ~line 201). Add:

```ts
    thecodeoriginIssuer: '',
    thecodeoriginClientId: '',
    thecodeoriginClientSecret: '',
```

(Leave the `googleClientId/Secret`, `githubClientId/Secret` keys for now —
Phase 03 removes them, so the app keeps building between phases.)

---

## Step 2.3 — env files

`.env` (local dev) and `.env.production` (prod) — the user already added
`CLIENT_ID` + `CLIENT_SECRET`. **Add the issuer** to both:

```bash
# THECODEORIGIN OIDC (self-hosted better-auth IdP)
NUXT_THECODEORIGIN_ISSUER=https://auth.thecodeorigin.com/api/auth
NUXT_THECODEORIGIN_CLIENT_ID=<from Phase 01>
NUXT_THECODEORIGIN_CLIENT_SECRET=<from Phase 01>
```

> For local dev pointing at a **local** IdP instead, set
> `NUXT_THECODEORIGIN_ISSUER=http://localhost:3000/api/auth` in `.env`
> (and register the localhost callback on that IdP).

`.env.example` — add the keys with empty values for documentation:

```bash
# =============================================================================
# THECODEORIGIN OIDC (self-hosted better-auth IdP)
# =============================================================================
NUXT_THECODEORIGIN_ISSUER=
NUXT_THECODEORIGIN_CLIENT_ID=
NUXT_THECODEORIGIN_CLIENT_SECRET=
```

---

## Step 2.4 — Initiate route (PKCE + state)

Create `layers/auth/server/api/auth/oidc.get.ts`:

```ts
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
```

Notes:
- `crypto.subtle`, `btoa`, `TextEncoder` are all global on Cloudflare Workers / Nitro.
- `getBaseUrl(event)` is auto-imported from `server/utils/url.ts`; in dev it yields `http://localhost:3002`, in prod `https://template.thecodeorigin.com`.
- No `nonce` (we don't validate the id_token — see plan rejected-alternatives).

---

## Step 2.5 — Callback route (exchange + userinfo + upsert)

Create `layers/auth/server/api/auth/oidc/callback.get.ts`:

```ts
import type { OidcUser } from '@nuxthub/db/schema'
import { ActivityAction, activityTable, identityTable, userTable } from '@nuxthub/db/schema'
import { and, eq } from 'drizzle-orm'
import { createPersonalOrganization } from '#layers/auth/server/services/organization'
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
        Authorization: `Basic ${encodeBase64(`${config.thecodeoriginClientId}:${config.thecodeoriginClientSecret}`)}`,
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
    await createPersonalOrganization(user)
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

  await persistSession(event, user, { provider: 'thecodeorigin' })
  await db.insert(activityTable).values({ user_id: user.id, action: ActivityAction.SIGN_IN })

  return sendRedirect(event, '/dashboard')
})
```

Notes:
- `db`, `getBaseUrl`, `encodeBase64`, `useNitroApp` are auto-imported (Nitro / NuxtHub) — same as the Google/GitHub callbacks. `encodeBase64` (`server/utils/base64.ts`) uses `Buffer`, safe for non-ASCII secrets (avoids `btoa` Latin-1 throw).
- `redirect_uri` is computed identically here and in `oidc.get.ts` → byte-identical, matches the registered URI.
- Errors from the IdP redirect to `/auth/login?error=…` instead of surfacing a raw 500.

---

## Step 2.6 — providers endpoint exposes `thecodeorigin`

`layers/auth/server/api/auth/providers.get.ts` — add the gate (Google/GitHub
removed in Phase 03; for now you may keep them so nothing 404s mid-phase):

```ts
export default defineEventHandler(() => {
  const config = useRuntimeConfig()
  return {
    credential: Boolean(config.adminEmail && config.adminPassword),
    thecodeorigin: Boolean(config.thecodeoriginIssuer && config.thecodeoriginClientId && config.thecodeoriginClientSecret),
  }
})
```

---

## Phase 02 checkpoint

- `pnpm exec nuxi db generate` → no new migration.
- `pnpm exec nuxi typecheck` → 0 (note: `AuthProviders` type / login card still reference google/github until Phase 03 — typecheck may flag the providers endpoint shape mismatch; that's expected and fixed in Phase 03. If you want a clean checkpoint, do Phase 03's type edits together with 2.6.)
- Manual smoke: with the dev server up and `.env` filled (incl. the issuer), hitting `http://localhost:3002/api/auth/oidc` should 302 to the IdP authorize URL.
