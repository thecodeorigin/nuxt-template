import { rmSync } from 'node:fs'
import { join } from 'node:path'
import { defineCommand } from 'citty'
import { nuxt, run } from '../lib/run'

const generate = defineCommand({
  meta: { name: 'generate', description: 'Generate a D1/SQLite migration from the schema diff' },
  async run() {
    const res = await nuxt(['db', 'generate'])
    console.log(res.stdout || res.stderr)
    process.exit(res.code)
  },
})

const migrate = defineCommand({
  meta: { name: 'migrate', description: 'Apply migrations (local by default)' },
  args: {
    remote: { type: 'boolean', description: 'Apply to the remote D1 (requires a prior `pnpm build`)', default: false },
    env: { type: 'string', description: 'production | preview (with --remote)', default: 'production' },
  },
  async run({ args }) {
    if (!args.remote) {
      const res = await nuxt(['db', 'migrate'])
      console.log(res.stdout || res.stderr)
      process.exit(res.code)
    }
    const res = await run('npx', ['--yes', 'wrangler', '--cwd', '.output/server', 'd1', 'migrations', 'apply', 'DB', '--remote'])
    console.log(res.stdout || res.stderr)
    process.exit(res.code)
  },
})

const sql = defineCommand({
  meta: { name: 'sql', description: 'Run an ad-hoc SQL query against local D1' },
  args: { query: { type: 'positional', required: true, description: 'SQL string' } },
  async run({ args }) {
    const res = await nuxt(['db', 'sql', args.query])
    console.log(res.stdout || res.stderr)
    process.exit(res.code)
  },
})

const reset = defineCommand({
  meta: { name: 'reset', description: 'Wipe local .data emulation, re-migrate' },
  async run() {
    rmSync(join(process.cwd(), '.data'), { recursive: true, force: true })
    console.log('removed .data')
    const res = await nuxt(['db', 'migrate'])
    console.log(res.stdout || res.stderr)
    console.log('reset done. run `pnpm dev` then `harness dev seed` to repopulate.')
  },
})

export const db = defineCommand({
  meta: { name: 'db', description: 'Database operations (generate / migrate / sql / reset)' },
  subCommands: { generate, migrate, sql, reset },
})
