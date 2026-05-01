# app/stores

> Pinia is for **globally shared, long-lived data only**. State here survives
> every route change — feature-scoped data parked in a store leaks memory the
> longer the user stays on the app.

## Belongs / does not belong

| Belongs here | Lives elsewhere |
|--------------|-----------------|
| Identity / session (`useAuthStore` — read by sidebar, navbar, route guards, CASL plugin) | CRUD resources (todos, blogs, posts, products, projects) → page-scoped state |
| Cross-page UI state that genuinely must persist (theme, global filters) | Anything scoped to a single page → page-scoped state |

## Conventions

| Topic | Rule |
|-------|------|
| File naming | `use<Name>Store.ts` exporting `use<Name>Store()` |
| Definition style | Setup-style: `defineStore('name', () => { ... })` |
| Action names | Verb-noun (`fetchCurrentUser`, `startImpersonation`) — see root `CLAUDE.md` |
| HTTP | Stores delegate to `app/api/use<Name>Api.ts` — never call `$http` directly |

## Page-scoped pattern (for CRUD resources)

```ts
// app/pages/blogs.vue
const blogApi = useBlogApi()

const { data: blogs, error } = useAsyncData(
  'blogs',
  () => blogApi.fetchBlogs(),
  { default: (): Blog[] => [] },
)
whenError(error)

provide(blogsKey, { blogs, /* mutations */ })
```

Descendants read via a typed `inject` helper — see `app/lib/useTodos.ts` for
the reference shape.
