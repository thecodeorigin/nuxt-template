# app/components

> Cross-cutting Vue components only. The dashboard shell is the textbook
> example — the dashboard pages are the project's home, but the cards inside
> them read from any layer (auth's `useAuthStore`, etc.). Anything
> feature-scoped goes in that feature's layer.

## Components are NOT auto-imported

The root `nuxt.config.ts` sets `components: false`, so user components
(`app/components/*` and `layers/*/app/components/*`) must be imported
explicitly in `<script setup>`. Nuxt UI's `<U*>` components are still
auto-imported because `@nuxt/ui` registers them through the module API.

```vue
<script setup lang="ts">
import DashboardSessionCard from '~/components/Dashboard/DashboardSessionCard.vue'
</script>

<template>
  <DashboardSessionCard />
</template>
```

This is intentional: explicit imports give AI agents (and humans) a
clickable path to the source instead of a magic global tag.

## Naming rule

The component name in `<script setup>` is whatever you import it as, but
keep filenames PascalCase + namespaced so the catalog stays consistent.
Each filename **starts with its parent folder's name**.

| Path | Default-imported as |
|------|---------------------|
| `Dashboard/DashboardSessionCard.vue` | `DashboardSessionCard` |
| `Dashboard/DashboardGettingStarted.vue` | `DashboardGettingStarted` |

Add a new namespace folder for a new cross-cutting component group; for
feature components, add them to the feature's layer instead. The full
per-layer component catalog lives in each layer's `app/components/CLAUDE.md`.
