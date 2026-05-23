# layers/auth/app/components

> Vue components for the auth domain, namespaced by feature folder. **Not
> auto-imported** — see the root `app/components/CLAUDE.md` for the
> rationale. Import them explicitly via `#layers/auth/app/components/...`.

## Naming rule

Each filename **starts with its parent folder's name**. Nested folders extend
the namespace by prefix.

| Path | Default-imported as |
|------|---------------------|
| `Auth/AuthLoginCard.vue` | `AuthLoginCard` |
| `Impersonate/ImpersonateMenu.vue` | `ImpersonateMenu` |
| `Impersonate/ImpersonateCandidateList.vue` | `ImpersonateCandidateList` |
| `Impersonate/ImpersonateStopButton.vue` | `ImpersonateStopButton` |
| `Organization/OrganizationMenu.vue` | `OrganizationMenu` (sidebar org switcher) |
| `Organization/OrganizationMemberList.vue` | `OrganizationMemberList` (members UTable + invite form + pending invitations) |
| `Organization/OrganizationMemberPermissionsModal.vue` | `OrganizationMemberPermissionsModal` |
| `Organization/OrganizationAddMemberModal.vue` | `OrganizationAddMemberModal` (direct add) |
| `User/UserMenu.vue` | `UserMenu` |

The `Organization/*` components consume the page-scoped `membersKey` inject
(`app/composables/useOrganizationMembers.ts`), so they only render inside a
page that calls `provide(membersKey, …)` — currently
`app/pages/organization/members.vue`.

When you add a new auth-domain component, drop it in the matching namespace
or open a new one. Don't put flat files at `components/`.

## Cross-layer usage

These components live in the auth layer but render anywhere — e.g.
`app/layouts/default.vue` (project root) imports `ImpersonateMenu` and
`UserMenu`:

```vue
<script setup lang="ts">
import ImpersonateMenu from '#layers/auth/app/components/Impersonate/ImpersonateMenu.vue'
import UserMenu from '#layers/auth/app/components/User/UserMenu.vue'
</script>
```

Use the `#layers/auth/...` alias from outside the auth layer; inside the
auth layer the same alias works (Nuxt resolves it identically) and is the
canonical choice — `~/components/...` would point to the project root.
