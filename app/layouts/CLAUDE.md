# app/layouts

> `default.vue` is the only layout. It owns the `UDashboardGroup` shell —
> sidebar, navbar, overlays, and the `<slot />` — and consumes the
> **layer registry** to compose navigation dynamically from layer contributions.

## Dynamic layout mechanism

Layers contribute UI slots at plugin time via `useLayerRegistry().contribute()`.
`default.vue` reads the resulting state and renders it — it never hard-codes
layer-specific items.

### Contribution contract

Each layer that needs sidebar/navbar presence ships a plugin named
`99.contribute.<layer>.client.ts` in its `app/plugins/` directory.
The `99.` prefix guarantees it runs after all stores and auth are ready.

```ts
// layers/<name>/app/plugins/99.contribute.<name>.client.ts
export default defineNuxtPlugin(() => {
  const { contribute } = useLayerRegistry()
  contribute({
    navItems: [/* sidebar links */],
    navbarItems: [/* navbar icon slots */],
    overlays: [/* full-screen overlays / slideovers */],
  })
})
```

### `navItems` — sidebar links

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Unique across all layers. Duplicates are silently dropped. |
| `label` | `string` | Display text. |
| `icon` | `string?` | Iconify class (`i-lucide-*`). |
| `to` | `string?` | Route path. Omit for trigger/group nodes. |
| `section` | `'main' \| 'settings' \| 'sub'` | Determines which nav group the item lands in (see below). |
| `priority` | `number` | Lower = higher in the list. Items within a section sort ascending by priority. |
| `ability` | `string \| string[]?` | CASL ability (OR semantics) required to show the item. |
| `type` | `'trigger'?` | Makes the item a collapsible group header. |
| `defaultOpen` | `boolean?` | Initial open state for trigger groups. |
| `children` | `RegistryNavItem[]?` | Nested items under a trigger group. |
| `onSelect` | `() => void?` | Custom click handler (for modal triggers, etc.). |

**Sections rendered by `default.vue`:**

- `main` — top nav group (Home, Products, Projects, …)
- `settings` — children of the "Settings" collapsible group (General, Notifications, Billing, Security, …)
- `sub` — bottom-pinned nav group (support actions, system admin, …)

**Priority reference (settings section):**

| Priority | Item |
|----------|------|
| 0 | General (`auth`) |
| 5 | Notifications (`auth`) |
| 10 | Billing (`billing`) |
| 30 | (reserved) |
| 40 | Security (`auth`) |

### `navbarItems` — top navbar icon slots

Components rendered in the dashboard toolbar (e.g. the notifications bell).
Sorted ascending by `priority`.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Unique. |
| `component` | `Component` | Vue component reference. Stored via `markRaw`. |
| `priority` | `number` | Lower = rendered first (left-most). |

### `overlays` — full-page overlays

Components mounted once at layout level (e.g. slidevers, modals that need to
survive page navigation). No priority — rendered in contribution order.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Unique. |
| `component` | `Component` | Stored via `markRaw`. |

### How `default.vue` consumes the registry

```
useLayerRegistry()
  .navItems  → sorted by priority → split by section → UNavigationMenu
  .navbarItems → (rendered in DashboardNavbar)
  .overlays  → <component :is="..."> for each overlay
```

The full logic lives in `app/layouts/default.vue`. Do not add
layer-specific conditionals there — extend the registry contract instead.

### Adding a new layer's contribution

1. Create `layers/<name>/app/plugins/99.contribute.<name>.client.ts`.
2. Call `contribute({ navItems, navbarItems, overlays })` with only the
   slots your layer needs.
3. Pick a `priority` that places the item in the right visual position
   relative to existing items (see the priority reference above).
4. Import components explicitly — `components: false` means nothing is
   auto-registered.
