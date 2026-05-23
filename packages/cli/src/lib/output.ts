export type Status = 'ok' | 'warn' | 'fail' | 'skip'

export interface Check {
  name: string
  status: Status
  detail: string
  fix?: string
}

const ICON: Record<Status, string> = { ok: '✔', warn: '!', fail: '✗', skip: '·' }

export function printChecks(checks: Check[]): void {
  for (const c of checks) {
    console.log(`${ICON[c.status]} ${c.name} — ${c.detail}`)
    if (c.fix && (c.status === 'fail' || c.status === 'warn'))
      console.log(`    fix: ${c.fix}`)
  }
}

export function printJson(data: unknown): void {
  console.log(JSON.stringify(data, null, 2))
}

export function exitFromChecks(checks: Check[]): never {
  process.exit(checks.some(c => c.status === 'fail') ? 1 : 0)
}
