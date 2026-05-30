export default defineTask({
  meta: {
    name: 'seed:all',
    description: 'Run every seed task in order (permissions → users → system org → demo org).',
  },
  run: async () => {
    const permissions = await runTask('seed:permissions')
    const users = await runTask('seed:users')
    const systemOrganization = await runTask('seed:system-organization')
    const demoOrganization = await runTask('seed:demo-organization')
    return { result: 'ok', permissions, users, systemOrganization, demoOrganization }
  },
})
