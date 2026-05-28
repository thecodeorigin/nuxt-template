# layers/project

> Self-contained Nuxt layer that owns the **project** abstraction — a
> user's bundle of one or more [products](../product/CLAUDE.md), plus the
> members who can access them. Auto-discovered from `<root>/layers/project/`.

## The abstract concept

A **project** is a container a user creates to use one or more products
together. Products are the indivisible billable atoms; a project is how a
real user assembles them.

In any business adapted from this template, "project" maps to whatever
the real-world container is:

| If the adapted business is… | A "project" is… |
|---|---|
| A subscription SaaS | The user's subscription / account |
| A team SaaS | A workspace / team / organization |
| A multi-tenant tool | A tenant |
| Pay-as-you-go | The user's wallet (with credit packs attached) |
| A storefront | A cart / order |
| A course platform | The student's library |

Concretely, a project has:
- A name, description, and status (`active | archived`)
- **Attached products** — a many-to-many with `quantity` (e.g. "this
  workspace uses 1 Pro plan + 3 Extra Seats")
- **Members** — users with a role (`owner | member | viewer`)

The owner pays. Members are granted access. Viewers see but don't edit.

`project` does **not** define the products themselves — that's
[`layers/product`](../product/CLAUDE.md). It links to them and tracks
ownership.

## What this layer owns

| Concern | Where |
|--------|------|
| Project + member + product-attachment schemas | `shared/schemas/project.ts` |
| Drizzle tables (projects, project_members, project_products) | `server/db/schema.ts` |
| CRUD + membership + product-attachment endpoints | `server/api/projects/*` |
| Client API (`fetchProjects`, `addProjectMember`, `addProjectProduct`, …) | `app/api/useProjectApi.ts` |
| List / form / detail / members / products components | `app/components/Project/*` |
| Pages (project list, detail, members) | `app/pages/*` |
| Sidebar contribution | `app/plugins/99.contribute.project.client.ts` |
| Layer composables | `app/composables/*` |

## Conventions

The root project's hard rules apply here (TDD, Nuxt UI only, semantic
colors, schema validation, no business logic in `utils/`, verb-noun
actions, namespaced `Project/Project*.vue` components). See root
`CLAUDE.md` for the full list.

### Adapting "project" to your business

Same as the product layer: only **user-facing labels** change.
File/type/function/table names stay `project`. A workspace-based
adaptation renders "Workspaces" in the sidebar but still writes
`fetchProjects()` in code.

### Membership model

- Membership is per-project (not global). A user can own one project and
  be a member of another, with no overlap.
- The `owner` role is the billing principal. Tenant abilities (e.g.
  `project:write:self`) are evaluated against the calling user's
  membership in the specific project, via the `defineSubject('project',
  { fetch })` mechanism from `layers/auth/server/services/casl.ts`.
- Inviting a user to a project goes through the existing invitation flow
  in `layers/auth` — the project layer just stores the resulting
  membership row.

### Imports inside the layer

Same rules as every layer:
- `~~/...` / `~/...` resolve to the **project root**, not the layer
- Use `#layers/project/...` for layer-internal references
- Components: explicit imports (`import ProjectList from
  '#layers/project/app/components/Project/ProjectList.vue'`)

### Adding a new project field

1. Extend `CreateProjectSchema` in `shared/schemas/project.ts`.
2. Add the column to `server/db/schema.ts`. Run `pnpm db:generate` then
   `pnpm db:migrate`.
3. Surface it in `app/components/Project/ProjectForm.vue` and the list.
4. Test: unit (schema), Nuxt-env (form), e2e (full flow).

### Linking to products

`AddProjectProductSchema` carries `product_id` + `quantity`. Pricing,
billing intervals, and currency belong on the **product** — projects
just hold quantities. When you compute "what does this project cost,"
join through `project_products` to `products` and sum.
