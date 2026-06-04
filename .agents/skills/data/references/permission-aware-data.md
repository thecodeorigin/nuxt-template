# Permission-Aware Data

> Every feature that adds a route, a sidebar item, an admin action, or
> a new entity must be paired with a permission review. This file is
> the checklist.

## Why this is non-negotiable

CASL ability gating is the spine of authz in this codebase. The
abilities live in three places that must stay synchronised:

| File | Role |
|---|---|
| `layers/auth/shared/permissions.ts` | The **catalog** — which ability keys exist and which org kind (system vs tenant) may hold them |
| `layers/auth/server/constants/defaults.ts` | `SYSTEM_GRANTS` (system-org only grants) |
| `layers/auth/shared/permissions.ts` | `DEFAULT_ROLE_ABILITIES` — demo/tenant tier grants (admin/member/guest); also `DEFAULT_PERSONAL_ORG_ABILITIES` / `DEFAULT_MEMBER_ABILITIES` |
| `layers/auth/server/tasks/create/admin.ts` (via `createSystemAdmin`) | The **production admin's grant set** — derived from `SYSTEM_GRANTS.admin` |

Drift between any of these three is a permission bug waiting to ship.
A new ability key with no default grant = no one has it in prod.
A new default grant that references a key not in the catalog = the
key is silently ignored at evaluation time. A `create:admin` that
doesn't get an ability defined for the system org = admins can't do
the thing.

## Checklist — run this when you add a feature

For any change that adds or modifies behaviour gated by a permission:

### 1. Does the change need a new ability key?

A new key is needed when the feature is a distinct verb on a distinct
subject and existing keys don't already cover it.

Examples:

| Feature | Needs new key? | Why |
|---|---|---|
| Add a "soft delete" to projects | No | `project:delete` already exists |
| Add a billing export | Yes | `billing:export` — distinct from `billing:read` |
| Add an invitation revoke | Maybe | `user:manage` (the existing key for member admin) often suffices |
| Add a staff-only product audit log | Yes | `product:audit` (system org only) |

If yes → add the key to `layers/auth/shared/permissions.ts`:

```ts
// New tenant-grantable key
export const TENANT_SUBJECTS: readonly string[] = ['user', 'project', 'billing', 'invoice']

// Or a new system-only key
export const SYSTEM_ABILITY_KEYS = new Set<string>([
  // ...existing
  'product:audit',
])
```

Re-run any tests that derive from the catalog — they will fail
loudly if a key is missing.

### 2. Does any default grant set need to include it?

Walk the four grant sources:

| Grant | Who gets it | When to add the new key |
|---|---|---|
| `SYSTEM_GRANTS.admin` (in `services/seed.ts`) | Production system admin (via `create:admin`) and dev/demo admins | If this is a system-level power (`*:manage`, `*:audit`) |
| `DEFAULT_ROLE_ABILITIES[DefaultRole.{ADMIN,MEMBER,GUEST}]` (in `shared/permissions.ts`) | Demo tenant org seed users and `roles:sync` materialized grants | If the new key is a tenant ability — pick which tier needs it |
| `DEFAULT_PERSONAL_ORG_ABILITIES` (in `shared/permissions.ts`) | Owner of a freshly-created personal org | If new tenants should have it by default |
| `DEFAULT_MEMBER_ABILITIES` (in `shared/permissions.ts`) | A user joining an org as a plain member (direct add or invitation accept) | If members (not just admins) should have it |

Update the relevant ones. Add a unit-test assertion to `seed.test.ts`
documenting the expectation (e.g. "demo guests do not get
`billing:export`").

### 3. Are existing live users missing the new ability?

For dev / fresh installs this fixes itself the next time the seed
tasks run. For **production** (and any preview that's been live for
more than a deploy), existing users won't have the new key on their
memberships row. You need a backfill task:

```ts
// layers/auth/server/tasks/update/grant-new-ability.ts
import { ALL_ABILITY_KEYS } from '#layers/auth/shared/permissions'
import { addAbilityToOrgMembers } from '#layers/auth/server/services/grants'

export default defineTask({
  meta: {
    name: 'update:grant-new-ability',
    description: 'Backfill <ability-key> on existing memberships that should have it.',
  },
  run: async () => {
    const result = await addAbilityToOrgMembers({
      ability: 'billing:export',
      where: { tenantOnly: true, abilityRequired: 'billing:read' },
    })
    return { result: 'ok', updated: result.count }
  },
})
```

The corresponding service reads each membership, adds the key if not
present, writes back — idempotent (`onConflictDoUpdate` or
diff-before-write). Then you also need to **refresh live KV sessions**
so the change takes effect without forcing a re-login — see
`layers/auth/server/services/session.ts` → `refreshUserSessions(userId)`.

### 4. Does the production admin need the new ability?

The `create:admin` task grants `SYSTEM_GRANTS.admin`. If your new
ability is a system power that admins should have, **add it to
`SYSTEM_GRANTS.admin` in `services/seed.ts`** — that automatically
applies to:

- The dev `seed:system-organization` task (re-grants admins)
- The production `create:admin` task (grants on first run; on re-run
  the upsert refreshes the abilities array)

So a single edit to `SYSTEM_GRANTS.admin` plus re-running
`create:admin` updates every system admin in any environment.

### 5. Does the UI hide / show on the new ability?

For each surface that should respect the new permission:

| Surface | Mechanism |
|---|---|
| Sidebar / nav item | The `useLayerRegistry().contribute({ navItems })` call should reference the ability key; check the layer's `99.contribute.<name>.client.ts` plugin |
| Page-level | `definePageMeta({ can: ['<ability>'] })` — middleware redirects unauthorized users to `/forbidden` |
| Component-level | `<Can I="<action>" a="<subject>">` or `useAbility()` |
| Server route | `defineAuthorizedHandler(['<ability>'], …)` |

Audit each of these explicitly. The skill `verify` (in particular
its `references/permission-matrix.md`) is the place to **validate**
your gating after writing it.

## Reverse direction: removing an ability

When deprecating a feature:

1. Remove all `<Can>` / `defineAuthorizedHandler` references to the
   key first (the UI and routes stop using it)
2. Remove the key from `SYSTEM_GRANTS` / `DEFAULT_ROLE_ABILITIES` /
   `DEFAULT_*_ABILITIES` (the seed defaults stop granting it)
3. Write a `refactor/` task that removes the key from existing
   memberships' `abilities` arrays (idempotent: read row, filter
   array, write back if changed)
4. **Last**: remove the key from the catalog in
   `layers/auth/shared/permissions.ts`. Removing it earlier would
   make `keysAllowedFor()` start filtering it out silently, masking
   the refactor's effect.
5. Refresh live KV sessions so the change takes effect immediately
   for anyone signed in (`refreshUserSessions(userId)`).

## Where this fits in the dev cycle

| Step | Who owns |
|---|---|
| Plan the feature → identify ability needs | `prep` skill |
| Add the catalog entry + grants | `data` skill (you are here) |
| Backfill task for live envs | `data` skill (`update:` verb) |
| Wire `<Can>` / `defineAuthorizedHandler` | `cook` skill |
| Validate the permission matrix lives up | `verify` skill (`permission-matrix.md`) |

If any of these five steps gets skipped, the feature ships a permission
hole. The root `CLAUDE.md` flags this as a hard rule.

## The canonical permission-lifecycle tasks

These tasks already exist in `layers/auth/server/tasks/`. They cover
the full lifecycle of users, admins, roles, and ability grants in any
environment — local, preview, prod. Use them; don't reinvent.

| Task | When to run | Service it wraps |
|---|---|---|
| **`seed:permissions`** | After editing the catalog in `layers/auth/shared/permissions.ts` (any env, including prod) | `seedPermissions()` |
| **`seed:users` / `seed:system-organization` / `seed:demo-organization` / `seed:all`** | Local dev / demo seeding only — never prod | `seedUsers()` / `seedSystemOrganization()` / `seedDemoOrganization()` |
| **`create:admin`** | First-deploy of any env — creates `admin@<NUXT_PUBLIC_BASE_DOMAIN host>` and grants `SYSTEM_GRANTS.admin`. Idempotent | `createSystemAdmin(input)` |
| **`update:admin`** | After editing `SYSTEM_GRANTS.admin` in `services/seed.ts` — re-applies the latest grants to every system admin and refreshes their live sessions | `regrantSystemAdmins()` |
| **`create:user`** | Create a single real user (and personal org). Idempotent | `createUser(input)` |
| **`create:users`** | Bulk-create users from a list. Each entry idempotent | `createUsers(inputs)` |
| **`update:user`** | Patch a user by email (profile, suspension, verification) and refresh their sessions | `updateUser({ email, patch })` |
| **`create:role`** | Create a named role in an org (catalog of permissions). Idempotent on `(org, name)` | `createOrganizationRole(input)` |
| **`update:role`** | Change a role's permissions or description; auto-refreshes the live sessions of every member holding the role | `updateOrganizationRole(input)` |
| **`update:grant-ability`** | Add an ability to a specific cohort (a role, a list of member emails, or all system admins). The right tool for "rolled out a paid feature, now grant the ability to existing Pro-plan customers" | `grantAbility({ ability, target })` |

### Recipe — rolling out a new paid feature

The walkthrough for "I added `<feature>:use`, paid plans should have
it, free plans shouldn't":

```bash
# 1. Add the ability key to the catalog (code change — no task)
#    Edit layers/auth/shared/permissions.ts, add 'feature:use' to
#    TENANT_ABILITY_KEYS.

# 2. Push the catalog to every env's permissions table
nuxt task run seed:permissions

# 3. Add the ability to the paid role's permissions (in each tenant
#    org that has a paid role). Service layer can iterate orgs:
nuxt task run update:grant-ability --payload '{
  "ability": "feature:use",
  "target": { "kind": "role", "organization_slug": "acme-co", "role_name": "Pro" }
}'

# 4. For ad-hoc allowlist (specific customers without a Pro role yet):
nuxt task run update:grant-ability --payload '{
  "ability": "feature:use",
  "target": { "kind": "members", "organization_slug": "acme-co", "emails": ["alice@acme.co"] }
}'
```

Sessions for affected users are refreshed automatically — they see
the new feature on the next page load, no re-login.

### Recipe — adding a new admin power

```bash
# 1. Add the key to SYSTEM_ABILITY_KEYS in
#    layers/auth/shared/permissions.ts
# 2. Add it to SYSTEM_GRANTS.admin in
#    layers/auth/server/services/seed.ts
nuxt task run seed:permissions    # push catalog
nuxt task run update:admin        # re-grant SYSTEM_GRANTS.admin to all system admins
```

`update:admin` reads the current `SYSTEM_GRANTS.admin` value and
writes it to every system-org member's `abilities`, then refreshes
their KV sessions. Idempotent — running it twice is fine.

### Recipe — provisioning a single customer

```bash
# Production-grade single user (not the dev seed)
nuxt task run create:user --payload '{"email":"founder@acme.com","name":"Founder"}'

# Bulk import from a list
nuxt task run create:users --payload '{"users":[
  {"email":"a@acme.com"},
  {"email":"b@acme.com","name":"Beta"}
]}'

# Patch a user
nuxt task run update:user --payload '{
  "email":"founder@acme.com",
  "patch": {"name":"Founder Person","verified":true}
}'
```
