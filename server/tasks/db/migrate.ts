import { runMigrations } from '../../utils/migrate'

export default defineTask({
  meta: {
    name: 'db:migrate',
    description: 'Apply pending Drizzle migrations against NUXT_POSTGRES_URL.',
  },
  async run() {
    const result = await runMigrations()
    return { result }
  },
})
