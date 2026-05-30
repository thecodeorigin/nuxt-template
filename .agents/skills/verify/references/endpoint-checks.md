# Endpoint Checks

> The UI exercises a subset of what each route can do. Verify the API
> surface directly to catch what the UI doesn't.

## Why this step

A passing walkthrough proves the happy UI path works. It doesn't prove:

- A malformed body returns 400 instead of crashing with 500
- An unauthenticated caller is rejected with 401 (not 200, not 500)
- A caller without the required ability is rejected with 403
- A caller asking for another tenant's resource gets 403/404 (not the
  data)
- Rate-limited endpoints actually rate-limit
- File-upload routes reject oversized / wrong-type files

These show up at the API layer, not the UI. Probe each route directly.

## Discover the changed routes

```bash
git diff --name-only <base>..HEAD | grep -E 'server/api/.*\.(get|post|patch|put|delete)\.ts$'
```

Add to the probe list any handler that was added or modified. Don't
forget routes in `server/routes/` (non-`/api` Nitro routes — image
serving, webhooks).

For each handler, note the wrapper used:

| Wrapper | Authn behaviour |
|---|---|
| `defineEventHandler` | Public — no session required |
| `defineAuthenticatedHandler` | Requires session (401 if missing) |
| `defineAuthorizedHandler([abilities], …)` | Requires session + listed abilities (401 / 403) |

The wrapper tells you the expected status code matrix per caller.

## The status-code matrix

For every modified route:

| Caller | Public route | `defineAuthenticatedHandler` | `defineAuthorizedHandler` |
|---|---|---|---|
| No session | 200 | **401** | **401** |
| Authenticated, lacks ability | 200 | 200 (if valid input) | **403** |
| Authenticated, has ability, missing body | 200 / 400 | 400 (Zod) | 400 (Zod) |
| Authenticated, has ability, malformed body | 400 | 400 | 400 |
| Authenticated, has ability, wrong tenant's ID | 200 (if public) | 403 or 404 (never 200) | 403 or 404 |
| Authenticated, has ability, valid body | 200 / 201 / 204 | 200 / 201 / 204 | 200 / 201 / 204 |

Any deviation is a finding. Specifically:

- 500 instead of 400 = unvalidated input reaching the handler
- 200 with another tenant's data = data leak
- 401 from a public route = misapplied wrapper
- 403 where 401 was expected (anonymous caller) = the route checks
  abilities before authn — okay functionally but confusing for clients

## Probing — three options

### Option A: `evaluate_script` from the authenticated browser

Cheapest. The browser already has the session cookie.

```js
evaluate_script(`
  const resp = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: '' }),     // empty name — should 400
    credentials: 'include',
  })
  return { status: resp.status, body: await resp.json() }
`)
```

### Option B: `curl` with explicit cookie

For probing as different users without disturbing the browser session:

```bash
# Grab a session for Alice
curl -s -c alice.cookies -X POST http://localhost:3002/api/auth/dev-login \
  -H 'content-type: application/json' \
  -d '{"email":"alice@seed.local"}'

# Use that cookie jar for probes
curl -s -b alice.cookies http://localhost:3002/api/projects/<bob-id>
# Expected: 403 or 404, NOT 200
```

### Option C: Mass-probe via a short Node script

When the change adds many routes:

```ts
// scripts/probe-routes.ts (run once, discard)
const routes = [
  ['GET', '/api/projects'],
  ['POST', '/api/projects', { name: 'x' }],
  // ...
]
const cookie = 'sessionid=...'
for (const [method, url, body] of routes) {
  const resp = await fetch(`http://localhost:3002${url}`, {
    method, headers: { cookie, 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  console.log(method, url, resp.status)
}
```

Don't commit the script — it's verification scaffolding.

## Routes that need extra scrutiny

### Mutations (POST / PATCH / PUT / DELETE)

- CSRF: `nuxt-security` enforces a CSRF token by default. From the
  browser via `evaluate_script` the cookie + same-origin handle it.
  From `curl` you need the header — confirm by running the probe and
  observing 403 if the token is missing.
- Idempotency: hit the route twice with the same body. Behaviour
  should be sane (either second call 200 with same result, or a
  proper 409 / 422).

### File uploads (`multipart/form-data`)

- Wrong MIME type → 400 / 415
- Oversized file → 413 (`nuxt-security` request-size limiter)
- Missing field → 400 (Zod)
- See `layers/auth/server/api/user/avatar.post.ts` for reference

### Webhooks (`server/api/payments/.../webhook.post.ts`)

- Missing signature → 401
- Invalid signature → 401
- Valid signature, valid payload → 200
- Valid signature, replay → idempotent (no double-credit)

### Rate-limited routes

For phone OTP, OAuth callbacks, password reset:

- Hit the route N times quickly (N = the configured limit + 1)
- Expected: first N succeed (per intent), N+1 returns 429
- See `layers/auth/server/api/auth/phone.patch.ts` for the KV-backed
  counter pattern

### Cron / task routes (`defineCronHandler`, `defineTaskHandler`)

These require a shared-secret header. Confirm:

- Missing header → 401
- Wrong header → 401
- Right header → 200

The secret lives in `NUXT_TASK_SECRET` / `NUXT_WEBHOOK_SIGNING_SECRET`
(generated by `pnpm cli dev setup`).

## OpenAPI cross-check

Nuxt's auto-generated OpenAPI at `/_nuxt/openapi.json` lists every
route. After modifying routes, fetch it and confirm the new routes
appear with correct request/response schemas:

```js
evaluate_script(`
  const resp = await fetch('/_nuxt/openapi.json')
  const spec = await resp.json()
  return Object.keys(spec.paths).filter(p => p.includes('<your prefix>'))
`)
```

A missing route = the file is named wrong (Nuxt requires
`<resource>/<action>.{get|post|patch|put|delete}.ts`).

## What to record

For each probed route, capture one line:

```
POST /api/projects
  anonymous            → 401  ✓
  alice no ability     → 403  ✓
  alice, body {}       → 400  ✓  (Zod: "name required")
  alice, body {name:"Acme"} → 201  ✓  (returns {id, name, created_at})
  alice, GET /projects/<bob-id> → 404  ✓
```

Anything that returns a status outside the expected set is a finding
for the report.
