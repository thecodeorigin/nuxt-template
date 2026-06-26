# Plan — "Sign in with THECODEORIGIN" (OIDC SSO) for nuxt-template

**Plan id:** `thecodeorigin-sso-oidc-c4`
**Target repo:** `D:\projects\nuxt-template` (cook runs here)
**Companion repo:** `D:\projects\better-auth` (the IdP — only a client registration, no code change required)

---

## Goal

Replace Google + GitHub social login in `nuxt-template` with a **single
"Sign in with THECODEORIGIN"** button that authenticates against the
self-hosted better-auth OIDC identity provider
(`auth.thecodeorigin.com`). Keep the existing credential / demo / dev
login blocks untouched.

This also answers the user's first question — **how to mint the
`client_id` / `client_secret`** — see Phase 01.

---

## Open questions (answer before/at cook start — defaults chosen so cook is NOT blocked)

1. **Which issuer for local dev?** — RESOLVED. Issuer is an explicit env var `NUXT_THECODEORIGIN_ISSUER` (no hardcoded default). Set it to `https://auth.thecodeorigin.com/api/auth` (the live IdP) in both `.env` and `.env.production`. The client was registered on the live IdP, so the redirect URIs `http://localhost:3002/api/auth/oidc/callback` and `https://template.thecodeorigin.com/api/auth/oidc/callback` must both be listed on it. (To point local dev at a local IdP instead, set `NUXT_THECODEORIGIN_ISSUER=http://localhost:3000/api/auth` in `.env`.)

2. **Keep the credential + demo + dev login blocks on the sign-in card?**
   → **Default: yes, keep them untouched.** The user scoped the change to "remove Google/GitHub, add THECODEORIGIN". Those blocks are orthogonal self-host/dev bootstrap paths. Only the social section changes.

3. **Remove `GOOGLE`/`GITHUB` from the `AuthProvider` enum?**
   → **Default: no — keep the enum literals, only ADD `THECODEORIGIN`.** The enum is TypeScript-only typing (no DB CHECK constraint — verified, see synthesis). Historical `identities` rows and existing tests reference `'google'`/`'github'`; removing the literals breaks them for zero runtime gain. The sign-in *option* is removed by deleting the routes + buttons + env, which is what matters.

---

## Approach (chosen)

Mirror the existing manual OAuth pattern (`auth/google.get.ts` +
`auth/google/callback.get.ts`), but implement a standards-correct **OIDC
Authorization Code flow with PKCE** because the IdP **forces PKCE**
(`requirePKCE: true`) on every client. The client is **confidential**
(`client_secret_basic`). Identity claims are read from the IdP's
`/oauth2/userinfo` endpoint (server-to-server over TLS) — no id_token /
JWKS verification needed for this trust model.

**Flow:**
1. `GET /api/auth/oidc` → set `state` + PKCE `code_verifier` cookies, redirect to `{issuer}/oauth2/authorize` with `code_challenge` (S256), `scope=openid profile email`.
2. IdP authenticates the user (its own login + consent) and redirects back to `GET /api/auth/oidc/callback?code&state`.
3. Callback validates `state`, exchanges `code` (+ `code_verifier`, Basic auth) at `{issuer}/oauth2/token`, calls `{issuer}/oauth2/userinfo`, **requires `email_verified`**, upserts `userTable` (by email) + `identityTable` (by `sub`), `persistSession(... provider: 'thecodeorigin')`, redirects `/dashboard`.

### Rejected alternatives
- **Add a better-auth client SDK / genericOAuth plugin to nuxt-template** — rejected: nuxt-template does **not** use better-auth; it has a custom REST/session system. Bolting on better-auth client just to consume one OIDC provider is a large, foreign dependency. The manual route pattern already exists and is proven (Google/GitHub).
- **Validate the signed id_token via JWKS instead of calling userinfo** — rejected (YAGNI): adds `jose` + signature/nonce/aud machinery for no gain here; userinfo is a trusted server-to-server TLS call and reliably returns `profile`/`email`/`picture`. (Revisit only if the IdP is ever made untrusted.)
- **Pass an OIDC `nonce`** — rejected: nonce only protects the id_token, which we never validate. Dead ceremony. Cut it.

---

## Phase table

| Phase | File | What | Depth |
|---|---|---|---|
| 01 | `phase-01-idp-client-registration.md` | Register the OAuth client on the IdP (browser-driven admin console) → get `client_id` + `client_secret`. Answers the user's Q. | Manual / browser |
| 02 | `phase-02-oidc-flow.md` | The two Nitro routes, schema (enum + `OidcUser` type), env + runtimeConfig, providers endpoint. | Code |
| 03 | `phase-03-ui-cleanup-verify.md` | Login card button swap, `AuthProviders` type, delete Google/GitHub routes + env + config, fix tests, verify live in browser. | Code + verify |

---

## Cross-phase file map

**better-auth (IdP) — no code change, runtime registration only:**
- IdP admin console `…/platform/applications/new` (Phase 01).
- *(optional dev convenience)* `server/tasks/seed/idp.ts` → add an entry to `DEMO_CLIENTS` (Phase 01, alt path).

**nuxt-template — create:**
- `layers/auth/server/api/auth/oidc.get.ts` (Phase 02)
- `layers/auth/server/api/auth/oidc/callback.get.ts` (Phase 02)

**nuxt-template — edit:**
- `layers/auth/server/db/schema.ts` — add `AuthProvider.THECODEORIGIN`, `OidcUser` interface, extend `provider_data` `$type` union (Phase 02)
- `nuxt.config.ts` — add `thecodeoriginIssuer` / `thecodeoriginClientId` / `thecodeoriginClientSecret` runtimeConfig; remove `googleClientId/Secret`, `githubClientId/Secret` (Phase 02 add, Phase 03 remove)
- `.env`, `.env.production`, `.env.example` — add `NUXT_THECODEORIGIN_*` (ISSUER + CLIENT_ID + CLIENT_SECRET); remove `NUXT_GOOGLE_*`, `NUXT_GITHUB_CLIENT_*` (note: keep `NUXT_GITHUB_REPOSITORY`/`NUXT_GITHUB_TOKEN` — those drive the **selfhost deploy** feature, not auth) (Phase 02 add, Phase 03 remove)
- `layers/auth/server/api/auth/providers.get.ts` — drop `google`/`github`, add `thecodeorigin` (Phase 03)
- `layers/auth/app/api/useAuthApi.ts` — `AuthProviders` interface: drop `google`/`github`, add `thecodeorigin` (Phase 03)
- `layers/auth/app/components/Auth/AuthLoginCard.vue` — swap social buttons for one THECODEORIGIN button (Phase 03)
- `layers/auth/test/nuxt/auth-login-card.test.ts` — update the `providers` mock shape (Phase 03)

**nuxt-template — delete:**
- `layers/auth/server/api/auth/google.get.ts`
- `layers/auth/server/api/auth/google/callback.get.ts`
- `layers/auth/server/api/auth/github.get.ts`
- `layers/auth/server/api/auth/github/callback.get.ts`

---

## Test / verification strategy

Oracles (run from `D:\projects\nuxt-template`):
1. `pnpm exec nuxi typecheck` → 0 errors (the `OidcUser` union + `AuthProviders` change must compile).
2. `pnpm lint` → clean.
3. `pnpm exec nuxi db generate` → **expect NO new migration** (enum is TS-only; `provider` column is plain `text`). If it emits SQL, stop and investigate.
4. `pnpm test` (vitest) → `auth-login-card.test.ts` green after mock update.
5. **Live browser walk** (Chrome DevTools MCP), the real acceptance test — see Phase 03.

---

## Acceptance criteria (concrete, checkable)

- [x] A confidential OAuth client exists on the IdP (registered by the user). Its `client_id`/`client_secret` are in nuxt-template `.env` (local dev) + `.env.production` (`template.thecodeorigin.com`) as `NUXT_THECODEORIGIN_CLIENT_ID`/`NUXT_THECODEORIGIN_CLIENT_SECRET`. **TODO:** add `NUXT_THECODEORIGIN_ISSUER=https://auth.thecodeorigin.com/api/auth` to both files, and verify the IdP client lists BOTH redirect URIs: `http://localhost:3002/api/auth/oidc/callback` and `https://template.thecodeorigin.com/api/auth/oidc/callback`.
- [ ] `/auth/login` shows exactly one external button, "Sign in with THECODEORIGIN" — **no** Google or GitHub button anywhere.
- [ ] Clicking it redirects to the IdP, authenticates, returns to `/api/auth/oidc/callback`, and lands the user on `/dashboard` with a working session (`/api/auth/me` returns the user, `provider: 'thecodeorigin'`).
- [ ] A new user gets a `userTable` row, a personal org (`createPersonalOrganization`), and an `identities` row with `provider='thecodeorigin'`, `provider_user_id=<sub>`. Re-login reuses them (no duplicates).
- [ ] Consent-denied / IdP-error redirects back to `/auth/login?error=…` (no raw 500).
- [ ] An unverified-email identity is rejected (400, no session) — account-hijack guard.
- [ ] `GET /api/auth/google` and `/api/auth/github` 404 (routes deleted); no `NUXT_GOOGLE_*` / `NUXT_GITHUB_*` auth env remain.
- [ ] typecheck + lint + vitest green; `nuxi db generate` produces no migration.

---

## Suggested cook invocation

```
/cook D:\projects\nuxt-template\.claude\plans\thecodeorigin-sso-oidc-c4\plan.md
```

Start with Phase 01 (register the client, capture secret into `.env`) because Phase 02/03 verification needs real credentials. Phases 02 and 03 are then a straight code edit + delete + live browser walk.
