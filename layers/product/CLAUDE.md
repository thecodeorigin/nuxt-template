# layers/product

> Self-contained Nuxt layer that owns the **product** abstraction — the
> smallest indivisible billable unit in this codebase. Auto-discovered from
> `<root>/layers/product/`.

## The abstract concept

A **product** is the smallest thing a user can be charged for. It is
indivisible — if you can sell half of it, it is two products, not one.

In any business adapted from this template, "product" maps to whatever the
real-world billable atom is:

| If the adapted business is… | A "product" is… |
|---|---|
| A subscription SaaS | A plan tier (Free, Pro, Business) |
| A SaaS with extras | The plan tier **and** each addon (extra seat, advanced analytics) |
| Pay-as-you-go | A credit pack, an API call bundle |
| A storefront | A single item in the catalog |
| A course platform | A course, a bundle, a coaching add-on |
| A bank-of-features app | Each unlockable feature toggle |

The schema reflects this: `type` is `one_time | recurring`; recurring
products require a `billing_interval` of `month` or `year`. Currencies
include USD/EUR/GBP/VND/JPY/AUD/CAD.

`product` does **not** model a user's ownership. Owning, bundling,
quantity, members — all of that lives in [`layers/project`](../project/CLAUDE.md).
A product on its own is just a SKU.

## What this layer owns

| Concern | Where |
|--------|------|
| Product schema (currencies, type, price, billing interval) | `shared/schemas/product.ts` |
| Drizzle table | `server/db/schema.ts` |
| CRUD endpoints | `server/api/products/*` |
| Client API (`fetchProducts`, `createProduct`, …) | `app/api/useProductApi.ts` |
| List / form / detail components | `app/components/Product/*` |
| Pages (catalog, detail) | `app/pages/*` |
| Sidebar contribution | `app/plugins/99.contribute.product.client.ts` |
| Layer composables | `app/composables/*` |

## Conventions

The root project's hard rules apply here (TDD, Nuxt UI only, semantic
colors, schema validation, no business logic in `utils/`, verb-noun
actions, namespaced `Product/Product*.vue` components). See root
`CLAUDE.md` for the full list.

### Adapting "product" to your business

When `/onboard` runs (or you rebrand by hand), only **user-facing labels**
change: component headings, page titles, schema `label` strings, sidebar
text. The file paths, type names, function names, and table name stay
`product` so the layer ownership invariant holds.

So: a music-streaming adaptation renders "Plans" in the sidebar but the
file is still `layers/product/app/components/Product/ProductList.vue` and
the function is still `fetchProducts()`.

### Imports inside the layer

Same rules as every layer:
- `~~/...` / `~/...` resolve to the **project root**, not the layer
- Use `#layers/product/...` for layer-internal references
- Schema/table imports come from `@nuxthub/db/schema`
- Components are NOT auto-imported — `import ProductList from
  '#layers/product/app/components/Product/ProductList.vue'`

### Authorization

Product CRUD is staff-managed (system abilities): `product:read`,
`product:write`, `product:delete`, `product:manage`. Tenant users see
products but don't mutate them — they attach products to their projects
via `layers/project`.

### Adding a new product field

1. Extend `ProductBaseSchema` in `shared/schemas/product.ts`.
2. Add the column to `server/db/schema.ts`. Run `pnpm db:generate` then
   `pnpm db:migrate`.
3. Surface it in `app/components/Product/ProductForm.vue` and
   `ProductList.vue`.
4. Test: unit for schema, Nuxt-env for form, e2e for the full flow.

Currency support: add to `PRODUCT_CURRENCIES` only — the union flows
through Zod and the DB column automatically.
