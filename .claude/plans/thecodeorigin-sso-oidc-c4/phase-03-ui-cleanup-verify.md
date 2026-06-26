# Phase 03 — UI swap, Google/GitHub removal, verification

All paths in `D:\projects\nuxt-template`.

---

## Step 3.1 — `AuthProviders` type

`layers/auth/app/api/useAuthApi.ts` (~line 13):

```ts
export interface AuthProviders {
  credential: boolean
  thecodeorigin: boolean
}
```

(Removes `google` / `github`.)

---

## Step 3.2 — Login card: one THECODEORIGIN button

`layers/auth/app/components/Auth/AuthLoginCard.vue`

1. Update the `useAsyncData` default (line ~16):

```ts
const { data: providers } = useAsyncData('auth-providers', fetchAuthProviders, {
  default: () => ({ credential: false, thecodeorigin: false }),
})
```

2. Replace the separator + the two social `<UButton>`s (the block at
lines ~229–254, from `<USeparator … label="or" />` through the GitHub
button) with:

```vue
      <USeparator v-if="providers.credential && providers.thecodeorigin" label="or" />

      <UButton
        v-if="providers.thecodeorigin"
        to="/api/auth/oidc"
        external
        block
        size="lg"
        icon="i-lucide-shield-check"
        color="primary"
        data-testid="signin-thecodeorigin"
      >
        Sign in with THECODEORIGIN
      </UButton>
```

3. Update the "no method configured" fallback (line ~256):

```vue
      <p v-if="!providers.credential && !providers.thecodeorigin" class="text-sm text-muted text-center">
        No sign-in method is configured yet.
      </p>
```

> Icon: `i-lucide-shield-check` (already in the bundled lucide set used
> elsewhere in this card — no new icon dependency, no CSP/img-src change).
> Do **not** reference a remote logo URL.

Leave the demo block, credential `UForm`, and dev-login block untouched.

---

## Step 3.3 — providers endpoint (finalize)

`layers/auth/server/api/auth/providers.get.ts` — already set in Step 2.6 to
return `{ credential, thecodeorigin }`. Confirm `google`/`github` keys are
gone.

---

## Step 3.4 — Delete Google + GitHub routes

```bash
rm layers/auth/server/api/auth/google.get.ts
rm layers/auth/server/api/auth/google/callback.get.ts
rm layers/auth/server/api/auth/github.get.ts
rm layers/auth/server/api/auth/github/callback.get.ts
```

(The empty `google/` and `github/` dirs can be removed too.)

---

## Step 3.5 — Remove Google/GitHub config + env

`nuxt.config.ts` `runtimeConfig` — delete:

```ts
    googleClientId: '',
    googleClientSecret: '',

    githubClientId: '',
    githubClientSecret: '',
```

`.env` and `.env.example` — delete the `NUXT_GOOGLE_*` and
`NUXT_GITHUB_CLIENT_*` lines.

> ⚠️ **Keep** `NUXT_GITHUB_REPOSITORY` and `NUXT_GITHUB_TOKEN` — those feed
> the `selfhost` deploy feature (`layers/selfhost/**`), not auth. Only the
> `NUXT_GITHUB_CLIENT_ID` / `NUXT_GITHUB_CLIENT_SECRET` pair is auth.

---

## Step 3.6 — Fix the login-card test

`layers/auth/test/nuxt/auth-login-card.test.ts` (line 7) — update the mock
shape so it matches `AuthProviders`:

```ts
const providers = { credential: true, thecodeorigin: false }
```

(The existing assertions only test the credential form, so no further test
changes are needed. If you want, add a case asserting
`[data-testid="signin-thecodeorigin"]` renders when `thecodeorigin: true`.)

---

## Step 3.7 — Static oracles

From `D:\projects\nuxt-template`:

```bash
pnpm exec nuxi db generate     # expect: no new migration
pnpm exec nuxi typecheck       # expect: 0 errors
pnpm lint                      # expect: clean
pnpm test                      # expect: green (auth-login-card)
```

Grep to confirm no auth-side Google/GitHub remains:

```bash
grep -rn "googleClient\|githubClient\|i-logos-google\|i-logos-github\|/api/auth/google\|/api/auth/github" layers/auth nuxt.config.ts
# expect: no matches
```

---

## Step 3.8 — Live browser verification (the real acceptance test)

Drive with Chrome DevTools MCP. Dev server: `pnpm dev` (nuxt-template on
`http://localhost:3002`). Ensure `.env` has real `NUXT_OIDC_*` from Phase 01.

1. **Button presence** — open `http://localhost:3002/auth/login`. Assert exactly one external button labelled **"Sign in with THECODEORIGIN"**; assert **no** "Continue with Google" / "Continue with GitHub" text anywhere.
2. **Happy path** — click it → lands on the IdP login (`auth.thecodeorigin.com`) → authenticate (+ consent if not skipped) → returns to `…:3002/api/auth/oidc/callback` → ends on `/dashboard`. Verify the dashboard renders a signed-in user.
3. **Session** — `GET http://localhost:3002/api/auth/me` returns the user JSON with `provider: 'thecodeorigin'`.
4. **Idempotent re-login** — log out, sign in again with the same IdP user → no duplicate `users`/`identities` row (check via the app's user list or a `nuxi db sql "select count(*) from identities where provider='thecodeorigin'"`).
5. **Error path** — start the flow and deny consent (or hit `/api/auth/oidc/callback?error=access_denied`) → redirected to `/auth/login?error=access_denied`, no 500.
6. **Deleted routes** — `GET http://localhost:3002/api/auth/google` → 404.

**Phase done when** all six checks pass and Step 3.7 oracles are green —
which satisfies the plan's acceptance criteria.
