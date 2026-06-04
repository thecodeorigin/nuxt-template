# Permission Matrix

> Verify that the right people see the feature and the wrong people
> don't, by switching identities and walking the same surface.

## Why this step matters

A feature can ship value to the target persona and still be broken:

- The sidebar link shows for users without the underlying ability
  (cosmetic leak)
- A user can open another tenant's resource by typing the ID in the
  URL (data leak)
- An admin can perform an action through the UI but the matching API
  route returns 403 (or vice versa — the UI hides it but the route
  allows it)
- Impersonation breaks scoping (the impersonator's abilities apply
  to the impersonated user's data — or the opposite)

The walkthrough in step 2 only verifies the **happy actor**. This step
verifies everyone else.

## Seed users (from `layers/auth/server/services/seed.ts`)

| Email | Role | Abilities (high-level) |
|---|---|---|
| `agent@localhost` | personal-org admin (auto-created) | own org admin |
| `admin@seed.local` | **system admin** | `system:manage`, `user:impersonate`, `support:manage`, `product:manage` |
| `alice@seed.local` | personal-org admin | her own org: `user:manage`, `project:manage`, `billing:*` |
| `bob@seed.local` | personal-org admin | his own org: same as alice but scoped to his org |
| anonymous | none | public routes only |

The demo org seeds three membership tiers (`admin`, `member`, `guest`)
— see `DEFAULT_ROLE_ABILITIES` in `shared/permissions.ts`. Use those tiers when the change
adds tenant-scoped abilities.

If a seed user is missing in the local DB:

```js
evaluate_script(`
  await fetch('/api/auth/dev-seed', { method: 'POST', credentials: 'include' })
`)
```

## Two mechanisms — pick the right one

### `POST /api/auth/dev-login` — switch identity cleanly

Use this for **baseline visibility checks** ("what does Alice see?").
Fast, no impersonation footprint, the session is just Alice's.

```js
async function loginAs(email) {
  await fetch('/api/auth/logout', { credentials: 'include' })
  const resp = await fetch('/api/auth/dev-login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email }),
    credentials: 'include',
  })
  return await resp.json()
}
```

### `POST /api/auth/impersonate/start` — verify the impersonation flow

Use this **when the change touches impersonation** or to verify
"what does an admin see through Alice's eyes". Sign in as admin first,
then start impersonation. The session swaps in-place; `session.impersonator`
tracks who's actually driving.

```js
// As admin
await fetch('/api/auth/dev-login', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'admin@seed.local' }),
  credentials: 'include',
})

// Find Alice's id
const aliceId = (await (await fetch('/api/auth/users', { credentials: 'include' }))
  .json()).find(u => u.primary_email === 'alice@seed.local').id

// Start impersonation
await fetch('/api/auth/impersonate/start', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ user_id: aliceId }),
  credentials: 'include',
})

// ... walk the feature ...

// Stop — always
await fetch('/api/auth/impersonate/stop', { method: 'POST', credentials: 'include' })
```

**Always stop impersonation** before moving to the next test. A
leaked impersonation session contaminates every subsequent step.

## Build the matrix

For each route or component the change touches, fill in:

| User | Should see / do | Saw / did | Verdict |
|---|---|---|---|
| `admin@seed.local` | ✓ full access | ✓ | PASS |
| `alice@seed.local` (own org) | ✓ within own org | ✓ | PASS |
| `alice@seed.local` (Bob's resource) | ✗ 403 | ✓ saw 403 | PASS |
| `bob@seed.local` | ✓ within own org | ✓ | PASS |
| anonymous | ✗ redirect to /login | ✓ redirected | PASS |
| admin impersonating Alice | sees as Alice, banner shows impersonation | ✓ | PASS |

Each row needs evidence — a snapshot for UI checks, an endpoint
response for API checks.

## What to check per cell

### Sidebar / nav visibility

`useLayerRegistry()` contributions can be ability-gated. After
switching identity, snapshot the sidebar and confirm:

- Items the user has ability for → visible
- Items the user lacks ability for → hidden (not just disabled)

A visible-but-disabled item is a leak — confirms the feature exists
even though the user can't use it.

### Page-level gating

`definePageMeta({ can: ['ability:name'] })` redirects unauthorized
users to `/forbidden`. After switching identity, navigate directly to
the page URL:

- Has ability → page renders
- Lacks ability → redirected to `/forbidden`
- Anonymous → redirected to login

### Component-level gating

`<Can I="action" a="subject">…</Can>` and `useAbility()` hide UI for
users who lack the ability. Snapshot the parent container after
switching identity and confirm the gated child is absent (not present
but invisible).

### Cross-tenant isolation

For any route that takes a resource ID:

- Look up an ID belonging to Bob (`alice@seed.local` should not see it)
- Sign in as Alice
- Navigate to the resource detail page with Bob's ID
- Expected: 403 / 404 / redirect — never 200 with Bob's data

The server route must filter by `session.userId` (or the org-scoped
equivalent). Missing filter = data leak — verifyable here, sometimes
invisible in the happy-path walkthrough.

## Anonymous baseline

Always include an anonymous row in the matrix. Log out first:

```js
await fetch('/api/auth/logout', { credentials: 'include' })
```

Then navigate to each public-facing route in the change. Expected:

- Public pages → render
- Authenticated pages → redirect to `/login`
- API routes → 401 (not 200, not 500)

A 500 on an unauthenticated request means the route didn't gate
authentication properly.

## Matrix cell verdicts

- **PASS** — actual matched expected
- **FAIL** — actual differs from expected. Most common failures:
  ability ungated, cross-tenant leak, sidebar leak, 500 instead of 401/403
- **N/A** — the role isn't a target of this feature (e.g. system admin
  rows on a tenant-only feature)

Skip N/A rows in the report only if you can explicitly justify why
they're irrelevant. "Not part of the plan" is an acceptable reason;
"I forgot to check" is not.
