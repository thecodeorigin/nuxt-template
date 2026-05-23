import { defineCommand } from 'citty'
import { callDevRoute } from '../lib/api'
import { ensureEnvFile, writeEnvKeys } from '../lib/keys'
import { printJson } from '../lib/output'

const urlArg = { type: 'string' as const, description: 'Dev server base URL', default: 'http://localhost:3002' }

const setup = defineCommand({
  meta: { name: 'setup', description: 'Create .env (from .env.example) and generate auth secrets' },
  run() {
    const { created } = ensureEnvFile()
    console.log(created ? 'created .env from .env.example' : '.env already present')
    for (const { key, action } of writeEnvKeys())
      console.log(`  ${action === 'added' ? '+' : '✔'} ${key} (${action})`)
    console.log('done. fill OAuth / SMTP / SePay values manually if needed.')
  },
})

const seed = defineCommand({
  meta: { name: 'seed', description: 'Seed local DB via /api/auth/dev-seed' },
  args: { url: urlArg },
  async run({ args }) {
    const res = await callDevRoute<{ users: Array<{ id: string, primary_email: string }> }>('/api/auth/dev-seed', undefined, args.url)
    printJson(res)
  },
})

const provision = defineCommand({
  meta: { name: 'provision', description: 'Provision a personal user + session via /api/auth/dev-provision' },
  args: {
    url: urlArg,
    email: { type: 'string', required: true, description: 'User email' },
    name: { type: 'string', description: 'Display name' },
  },
  async run({ args }) {
    const res = await callDevRoute('/api/auth/dev-provision', { email: args.email, name: args.name }, args.url)
    printJson(res)
  },
})

const login = defineCommand({
  meta: { name: 'login', description: 'Issue a session for an existing user via /api/auth/dev-login' },
  args: { url: urlArg, email: { type: 'string', required: true, description: 'User email' } },
  async run({ args }) {
    const res = await callDevRoute('/api/auth/dev-login', { email: args.email }, args.url)
    printJson(res)
  },
})

const cleanup = defineCommand({
  meta: { name: 'cleanup', description: 'Delete users + sessions via /api/auth/dev-cleanup' },
  args: {
    url: urlArg,
    emails: { type: 'string', description: 'Comma-separated emails' },
    sessions: { type: 'string', description: 'Comma-separated session ids' },
  },
  async run({ args }) {
    const split = (s?: string) => (s ? s.split(',').map(x => x.trim()).filter(Boolean) : [])
    const res = await callDevRoute('/api/auth/dev-cleanup', {
      emails: split(args.emails),
      session_ids: split(args.sessions),
    }, args.url)
    printJson(res)
  },
})

export const dev = defineCommand({
  meta: { name: 'dev', description: 'Local dev environment + agent backdoor helpers' },
  subCommands: { setup, seed, provision, login, cleanup },
})
