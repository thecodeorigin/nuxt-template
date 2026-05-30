# layers/support

> Owns the customer-support **domain**: tickets + threaded messages, the ticket
> service, user-facing submission/conversation UI, and the 24h reminder job.
> The platform-staff **inbox** (`/system/tickets`) and its API live in
> `layers/system/` (a layer owns what it routes and gates). Auto-discovered from
> `<root>/layers/support/`.

## What this layer owns

| Concern | Where |
|--------|------|
| Ticket + message tables, enums | `server/db/schema.ts` |
| Zod schemas + wire mappers | `shared/schemas/ticket.ts` |
| All ticket business logic + reminders + demo seed | `server/services/ticket.ts` |
| User submission/list/reply routes | `server/api/support/tickets/**` |
| Reminder Nitro scheduled task | `server/tasks/support/*` (`defineScheduledTask`) |
| User API wrapper + page-scoped inject | `app/api/useSupportApi.ts`, `app/composables/useSupportTickets.ts` |
| User pages/modals + shared conversation UI | `app/pages/support.vue`, `app/components/Support/*` |

## Conventions

Same hard rules as root. Layer-specific notes:

- **Gating.** User routes use `defineAuthenticatedHandler`; user reads are scoped
  by **ownership (`user_id = session.id`)**, not the active org, so a user keeps
  access to their own ticket after switching orgs. The staff side is gated
  `support:manage` (defined in `layers/auth/shared/permissions.ts`).
- **Messages are plain text**, rendered with Vue interpolation (escaped). Never
  render a message body as HTML. `xssValidator` is disabled on the ticket route
  subtrees in `nuxt.config.ts` (legit error reports contain `<`/`>`).
- **Email goes through `sendUserEmail`** (`#layers/auth/server/services/email`);
  the reminder composer escapes every interpolated value.
- **Cross-layer.** `#layers/auth/...` for auth services, `@nuxthub/db` +
  `@nuxthub/db/schema` for data, `#layers/notifications/server/services/notification`
  for the in-app reply notification, `~~/server/utils/url` for `getBaseUrl`.
- **Components are not auto-imported** — import explicitly via
  `#layers/support/app/components/Support/...`.
