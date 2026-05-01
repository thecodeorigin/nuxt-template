// Auth layer — sessions, OAuth, CASL authorization, impersonation, seeded users.
// Auto-discovered by Nuxt because it lives under <root>/layers/.
export default defineNuxtConfig({
  $meta: {
    name: 'auth',
  },
  imports: {
    // @pinia/nuxt only scans the root srcDir's stores by default; opt the
    // layer's stores into the auto-import scan so useAuthStore() is callable
    // anywhere without an explicit import.
    dirs: ['stores'],
  },
})
