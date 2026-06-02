import type { ChildProcess } from 'node:child_process'
import { defineCommand } from 'citty'
import { callDevRoute } from '../lib/api'
import { ensureEnvFile, writeEnvKeys } from '../lib/keys'
import { printJson } from '../lib/output'
import { killTree, spawnPkg } from '../lib/run'

const urlArg = { type: 'string' as const, description: 'Dev server base URL', default: 'http://localhost:3002' }

/** Split a stream chunk into complete lines, carrying any partial trailing line. */
export function splitChunk(carry: string, chunk: string): { lines: string[], carry: string } {
  const parts = (carry + chunk).split('\n')
  return { carry: parts.pop() ?? '', lines: parts }
}

const LABEL_COLORS: Record<string, string> = { nuxt: '[36m', mail: '[35m' }
const TRAILING_CR = /\r$/

const up = defineCommand({
  meta: { name: 'up', description: 'Run nuxt dev + maildev together; stream both, kill both on exit' },
  args: {
    port: { type: 'string', default: '3002', description: 'Nuxt dev port' },
    smtp: { type: 'string', default: '1025', description: 'MailDev SMTP port' },
    web: { type: 'string', default: '1080', description: 'MailDev web UI port' },
  },
  run({ args }) {
    return new Promise<void>((resolve) => {
      const children: ChildProcess[] = []
      let shuttingDown = false

      const shutdown = (code: number) => {
        if (shuttingDown)
          return
        shuttingDown = true
        for (const child of children)
          killTree(child)
        setTimeout(() => {
          resolve()
          process.exit(code)
        }, 200)
      }

      const start = (name: string, pkg: string, cmdArgs: string[]) => {
        const tag = `${LABEL_COLORS[name] ?? ''}[${name}][0m`
        const child = spawnPkg(pkg, cmdArgs)
        children.push(child)

        const forward = (stream: NodeJS.ReadableStream | null, sink: NodeJS.WriteStream) => {
          let carry = ''
          stream?.on('data', (chunk: Buffer) => {
            const split = splitChunk(carry, chunk.toString())
            carry = split.carry
            for (const line of split.lines)
              sink.write(`${tag} ${line.replace(TRAILING_CR, '')}\n`)
          })
          stream?.on('end', () => {
            if (carry)
              sink.write(`${tag} ${carry.replace(TRAILING_CR, '')}\n`)
          })
        }
        forward(child.stdout, process.stdout)
        forward(child.stderr, process.stderr)

        child.on('exit', (code) => {
          process.stderr.write(`${tag} exited (code ${code ?? 'unknown'})\n`)
          shutdown(code ?? 1)
        })
        child.on('error', (err) => {
          process.stderr.write(`${tag} failed to start: ${String(err)}\n`)
          shutdown(1)
        })
      }

      process.on('SIGINT', () => shutdown(0))
      process.on('SIGTERM', () => shutdown(0))

      start('nuxt', 'nuxt', ['dev', '--port', args.port])
      start('mail', 'maildev', ['--smtp', args.smtp, '--web', args.web])
    })
  },
})

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
  meta: { name: 'seed', description: 'Seed local DB via /api/auth/demo/dev-seed' },
  args: { url: urlArg },
  async run({ args }) {
    const res = await callDevRoute<{ users: Array<{ id: string, primary_email: string }> }>('/api/auth/demo/dev-seed', undefined, args.url)
    printJson(res)
  },
})

const provision = defineCommand({
  meta: { name: 'provision', description: 'Provision a personal user + session via /api/auth/demo/dev-provision' },
  args: {
    url: urlArg,
    email: { type: 'string', required: true, description: 'User email' },
    name: { type: 'string', description: 'Display name' },
  },
  async run({ args }) {
    const res = await callDevRoute('/api/auth/demo/dev-provision', { email: args.email, name: args.name }, args.url)
    printJson(res)
  },
})

const login = defineCommand({
  meta: { name: 'login', description: 'Issue a session for an existing user via /api/auth/demo/dev-login' },
  args: { url: urlArg, email: { type: 'string', required: true, description: 'User email' } },
  async run({ args }) {
    const res = await callDevRoute('/api/auth/demo/dev-login', { email: args.email }, args.url)
    printJson(res)
  },
})

const cleanup = defineCommand({
  meta: { name: 'cleanup', description: 'Delete users + sessions via /api/auth/demo/cleanup' },
  args: {
    url: urlArg,
    emails: { type: 'string', description: 'Comma-separated emails' },
    sessions: { type: 'string', description: 'Comma-separated session ids' },
  },
  async run({ args }) {
    const split = (s?: string) => (s ? s.split(',').map(x => x.trim()).filter(Boolean) : [])
    const res = await callDevRoute('/api/auth/demo/cleanup', {
      emails: split(args.emails),
      session_ids: split(args.sessions),
    }, args.url)
    printJson(res)
  },
})

export const dev = defineCommand({
  meta: { name: 'dev', description: 'Local dev environment + agent backdoor helpers' },
  subCommands: { up, setup, seed, provision, login, cleanup },
})
