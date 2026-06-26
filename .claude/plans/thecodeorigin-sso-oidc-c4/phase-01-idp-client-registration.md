# Phase 01 — Register the OAuth client on the IdP (get client_id + client_secret)

> ✅ **STATUS: DONE.** The user promoted `contact@thecodeorigin.com` to
> `role = admin` (via the live D1), registered the confidential client on
> the IdP, and put `NUXT_THECODEORIGIN_CLIENT_ID` +
> `NUXT_THECODEORIGIN_CLIENT_SECRET` into nuxt-template `.env` (local dev)
> and `.env.production` (`template.thecodeorigin.com`).
>
> **Remaining for this phase (verify before cook Phase 03 testing):**
> 1. Add `NUXT_THECODEORIGIN_ISSUER=https://auth.thecodeorigin.com/api/auth` to `.env` and `.env.production`.
> 2. Confirm the IdP client lists **both** redirect URIs:
>    `http://localhost:3002/api/auth/oidc/callback` **and**
>    `https://template.thecodeorigin.com/api/auth/oidc/callback`.
>    (Add the prod one in the IdP admin console if missing — exact match is required.)

This phase answers the user's first question directly: **how to mint the
`client_id` / `client_secret`** from the `better-auth` IdP so
`nuxt-template` can use it.

The IdP is a full OIDC provider. A relying party (RP) like nuxt-template
must be registered as an **OAuth client**. There are two ways; **Path A
is the recommended, browser-driven answer.**

---

## Key facts about IdP clients (verified from `D:\projects\better-auth`)

- Clients are confidential or public. We need **confidential** (web app that can keep a secret) → it gets a `client_secret`.
- The IdP **forces PKCE** on every client (`server/services/client.ts` always sets `requirePKCE: true`). Our flow handles it (Phase 02).
- Grant types are always `authorization_code` + `refresh_token`; response type `code`.
- Redirect URIs must be **absolute `http(s)://` URLs with no fragment**; matched **exactly** at authorize/token time. `http://localhost:*` is allowed.
- The **client secret is shown exactly once** in a non-dismissible modal — copy it immediately; it is stored hashed and can only be **rotated**, never re-displayed.
- Scopes available: `openid`, `profile`, `email`. Userinfo additionally returns the IdP's custom claims (`org`, `roles`, `personal`, `entitlement`).
- The OIDC endpoints (issuer base = `https://auth.thecodeorigin.com/api/auth`):
  - authorize: `…/api/auth/oauth2/authorize`
  - token: `…/api/auth/oauth2/token`
  - userinfo: `…/api/auth/oauth2/userinfo`
  - discovery: `…/api/auth/.well-known/openid-configuration`

---

## Path A — Admin console (recommended; browser-driven)

**Prereq:** a sysadmin account on the IdP (seeded by `seed:idp` in
better-auth). If running against the live IdP, use your existing admin
login at `https://auth.thecodeorigin.com`.

Steps (drive with Chrome DevTools MCP, or do by hand):

1. Open `https://auth.thecodeorigin.com/sign-in` and log in as a **system admin**.
2. Navigate to **`/platform/applications/new`**.
3. Fill the form:
   - **Name:** `THECODEORIGIN RP — nuxt-template`
   - **Type:** `Web (confidential)`  → ensures a `client_secret` is issued. Leave **"Public client" unchecked**.
   - **Redirect URIs** (add one per environment you need):
     - dev: `http://localhost:3002/api/auth/oidc/callback`
     - prod: `https://template.thecodeorigin.com/api/auth/oidc/callback`
   - **Skip consent screen:** ✅ check it — first-party app, skips the per-login consent prompt. (If you *want* users to see a consent screen, leave unchecked.)
4. Submit. The **once-only secret modal** appears. **Copy `clientId` and `clientSecret` immediately.**
5. You're redirected to `/platform/applications/{clientId}` — confirm the redirect URI(s) are listed.

> ⚠️ The `redirect_uri` sent during the flow (Phase 02) is
> `${getBaseUrl(event)}/api/auth/oidc/callback`. In local dev that
> resolves to `http://localhost:3002/api/auth/oidc/callback` — it must be
> **byte-identical** to a registered URI or the IdP rejects the request.
> This is the #1 failure mode.

---

## Path B — Dev seed (scripted alternative, local IdP only)

Use this only if you're running the IdP locally and want a reproducible,
no-clicking registration. In `D:\projects\better-auth`:

Add an entry to `DEMO_CLIENTS` in `server/tasks/seed/idp.ts`:

```ts
const DEMO_CLIENTS = [
  // …existing entries…
  { name: 'nuxt-template', redirectUris: ['http://localhost:3002/api/auth/oidc/callback'], public: false },
]
```

Then, with the IdP dev server running (`pnpm dev` in better-auth):

```bash
curl -X POST http://localhost:3000/_nitro/tasks/seed:idp
```

The task writes created clients (including **plaintext secret**, dev only)
to `D:\projects\better-auth\.clients.json`. Read the `nuxt-template`
entry's `clientId` + `clientSecret` from there.

> If you take Path B, set `NUXT_OIDC_ISSUER=http://localhost:3000/api/auth`
> in nuxt-template and keep the local IdP running during testing.

---

## Output of this phase → into nuxt-template `.env`

Whichever path, you end with three values. They are wired into
`nuxt-template/.env` + `.env.production` in Phase 02:

```bash
NUXT_THECODEORIGIN_ISSUER=https://auth.thecodeorigin.com/api/auth   # or http://localhost:3000/api/auth for Path B
NUXT_THECODEORIGIN_CLIENT_ID=<clientId from the modal / .clients.json>
NUXT_THECODEORIGIN_CLIENT_SECRET=<clientSecret from the modal / .clients.json>
```

**Done when:** you hold a valid `client_id` + `client_secret` for a
confidential client whose redirect URI exactly matches
`http://localhost:3002/api/auth/oidc/callback`.
