import { registerEndpoint } from '@nuxt/test-utils/runtime'

// The @thecodeorigin/auth module ships an async boot plugin (`0.session`) that
// fetches `/api/_auth/session`, plus a global route middleware that redirects
// unauthenticated users to the (external) sign-in URL. During `setupNuxt()` the
// app's initial navigation (`/` → `/dashboard`) would trigger that external
// redirect, which never resolves in the test env and hangs the setup hook.
//
// Registering a logged-in session here makes the boot plugin resolve to an
// authenticated admin, so the middleware lets navigation through and the app
// boots cleanly. `systemRole: 'admin'` grants `manage all` via the ability
// plugin, so ability-gated components/pages render in tests.
//
// Some files in the nuxt project opt out via `// @vitest-environment happy-dom`,
// where the test-utils runtime app (`window.__app`) is absent — skip there.
if (typeof window !== 'undefined' && '__app' in window) {
  registerEndpoint('/api/_auth/session', () => ({
    user: {
      id: 'test-user',
      email: 'test@example.com',
      name: 'Test User',
    },
    systemRole: 'admin',
    abilities: [],
    impersonator: null,
    organizations: [],
  }))
}
