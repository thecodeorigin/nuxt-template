# app/components

> Auto-imported Vue components. Filename = call-site name; namespace by folder
> so Nuxt's auto-import never collides.

## Naming rule

Each filename **starts with its parent folder's name**. Nested folders extend
the namespace by prefix.

| Path | Auto-imported as |
|------|------------------|
| `Auth/AuthLoginCard.vue` | `<AuthLoginCard>` |
| `Foo/FooComp.vue` | `<FooComp>` |
| `Foo/FooPanel/FooPanel.vue` | `<FooPanel>` |
| `Foo/FooPanel/FooPanelSidebar.vue` | `<FooPanelSidebar>` |

Add a new namespace folder for a new feature; don't drop flat files into
`components/`. Existing namespaces are listed in the root `CLAUDE.md` project
layout.
