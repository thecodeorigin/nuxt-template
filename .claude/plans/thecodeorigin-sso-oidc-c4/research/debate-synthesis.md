# Debate synthesis — thecodeorigin-sso-oidc-c4

Two critics ran in parallel: a YAGNI/KISS critic and a security +
failure-mode critic. Below: every objection and its disposition.

## Inter-critic contradiction — RESOLVED

The security critic's **BLOCKER 4** claimed inserting `provider='thecodeorigin'`
would fail because "SQLite enforces the CHECK constraint Drizzle generates
for the enum". The YAGNI critic assumed no migration needed.

**Verified against the actual generated migration**
(`server/db/migrations/sqlite/0000_outgoing_leo.sql:16`):

```sql
`provider` text NOT NULL,
```

No CHECK constraint. Drizzle's `text({ enum })` is **TypeScript-only**; it
emits plain `text` for SQLite. → **The security critic is wrong on this
point.** Adding the enum value is a type-level change; `nuxi db generate`
produces **no migration**. We still add the literal to `AuthProvider` for
TS correctness. Recorded as plan acceptance check #3 / Step 2.1.

## YAGNI critic

| Objection | Disposition |
|---|---|
| Cut the `nonce` — unused without id_token validation | **Accept.** Removed nonce param + cookie. Two cookies (state + verifier). |
| Keep userinfo as the single claims source; do NOT also decode id_token | **Accept.** Plan uses userinfo only. |
| Three cookies → two | **Accept** (falls out of nonce removal). |
| Reuse existing `provider_data` type instead of a new `OidcUser` interface | **Reject.** `provider_data` is typed `GoogleUser | GitHubUser`; the IdP returns extra custom claims (org/roles/entitlement). A small `OidcUser` interface is the cleanest way to extend the union and type the userinfo fetch. Minimal, not overengineering. |
| Keep credential/demo/dev login blocks untouched | **Accept.** Out of scope; plan leaves them as-is. |
| `redirect_uri` must be byte-identical authorize↔token and registered | **Accept** (not a cut — a correctness note). Both routes derive it from `getBaseUrl(event)`; called out in Phase 01 & 02. |

## Security / failure-mode critic

| # | Objection | Disposition |
|---|---|---|
| 1 | PKCE challenge must be **base64url** (not standard base64) | **Accept.** `toBase64Url()` helper does `+/→-_` and strips `=`. Explicit in Step 2.4 with a comment. |
| 2 | PKCE verifier must be **43–128 chars** (RFC 7636) | **Accept.** `simplifyNanoId(64)` — 64 chars, alphabet `0-9a-z` is unreserved-safe. |
| 3 | **`email_verified` guard** to prevent account hijack via unverified email | **Accept (BLOCKER).** Callback requires `email_verified` true (handles `true` and `'true'`) before any email-based upsert. This is *stronger* than the existing Google/GitHub callbacks (which rely on the provider). |
| 4 | "enum insert fails at D1 — migration required" | **Reject** — factually wrong (see contradiction section). No CHECK constraint exists. Add the TS literal only; no migration. |
| 5 | Handle `?error=` on the callback → redirect to login, not 400/500 | **Accept.** First branch of the callback redirects to `/auth/login?error=…`. |
| 6 | Wrap token + userinfo `$fetch` in try/catch → redirect, not raw 500 | **Accept.** Both wrapped; redirect to `/auth/login?error=token_exchange_failed` / `userinfo_failed`. |
| 7 | Nonce is dead code with userinfo | **Accept** (same as YAGNI) — removed. |
| 8 | Type the userinfo response; normalize `email_verified` (`boolean \| string`) | **Accept.** `OidcUser` interface; guard accepts boolean or `'true'`. |
| 9 | `redirect_uri` not overridable; relies on Host header | **Defer / Reject for now.** `getBaseUrl(event)` reads the CF-validated Host (documented-safe on Workers) and mirrors the existing Google/GitHub routes. Adding a `oidcRedirectBase` override is YAGNI for the stated single-host dev+prod setup. Revisit only if deployed off-CF. |
| 10 | State entropy: use 32 chars not 21 | **Accept.** `simplifyNanoId(32)` for state (~165 bits). |
| 11 | `btoa` Basic-auth header throws on non-Latin-1 secrets | **Accept.** Use `encodeBase64()` (`server/utils/base64.ts`, `Buffer`-based) instead of `btoa` for the Basic header. |

## Net effect on the plan

Smaller and safer than the first draft: nonce + its cookie removed;
base64url + verifier-length + `email_verified` + error-handling + typed
userinfo + Buffer-based Basic auth all folded in. No migration. ~12 files
in nuxt-template; zero code change in the IdP (runtime client registration
only).
