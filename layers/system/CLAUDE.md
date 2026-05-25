# layers/system

> Self-contained layer for platform/admin tooling gated by the `system:manage`
> ability (held by members of the `is_system` org). Auto-discovered from
> `<root>/layers/system/`.

## What this layer owns

| Concern | Where |
|--------|------|
| System Administration shell + nav | `app/pages/system.vue` |
| Email dispatch tool (the "Notifications" page) | `app/pages/system/notifications.vue`, `app/components/System/SystemEmailDispatch.vue` |
| Dispatch client wrappers | `app/api/useSystemApi.ts` |
| Dispatch validation | `shared/schemas/dispatch.ts` |
| Recipient resolution + email composition | `server/services/dispatch.ts` |
| Dispatch routes (options/preview/send) | `server/api/system/dispatch/*` |
| Support ticket inbox (page + nav) | `app/pages/system/tickets.vue`, `app/pages/system.vue` |
| Agent ticket API (gated support:manage) | `server/api/system/tickets/*` |
| Agent ticket client wrapper | `app/api/useSystemTicketApi.ts` |
| Inbox UI (reuses support layer's SupportConversation) | `app/components/System/SystemTicketInbox.vue` |

## Conventions

Same hard rules as root + auth. Layer-specific notes:

- **Gating.** Every page sets `definePageMeta({ can: ['system:manage'] })`; every
  server route uses `defineAuthorizedHandler(['system:manage'], ...)` from
  `#layers/auth/server/services/casl`. The ability itself is defined in the auth
  layer (`layers/auth/shared/permissions.ts`); this layer only references the string.
- **Cross-layer.** Use `#layers/auth/...` for auth services (`user-email`, `casl`),
  `@nuxthub/db` + `@nuxthub/db/schema` for data, `~~/server/utils/mail` for the
  transport, `~~/shared/schemas/pagination` for list query shapes.
- **Opt-out invariant.** All user email goes through
  `sendUserEmail` (`#layers/auth/server/services/user-email`) — never call
  `sendMail` directly for a user.
- **Components are not auto-imported** (`components: false`). Import explicitly via
  `#layers/system/app/components/System/...`.
