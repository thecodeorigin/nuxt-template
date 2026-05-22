import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// The whole authorization model trusts that `session:{sid}` is written from
// exactly one place. Any other writer could mint a session with abilities that
// never passed through buildSession's effective-union resolution.
const ROOTS = ['layers', 'server', 'app']
const WRITE_PATTERN = /kv\.set\(\s*`session:/

function collectTsFiles(dir: string): string[] {
  let out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.nuxt')
      continue
    const full = join(dir, entry.name)
    if (entry.isDirectory())
      out = out.concat(collectTsFiles(full))
    else if (entry.name.endsWith('.ts'))
      out.push(full)
  }
  return out
}

describe('session writer invariant', () => {
  it('only services/session.ts writes session:{sid} via kv.set', () => {
    const offenders = ROOTS
      .flatMap(collectTsFiles)
      .filter(file => WRITE_PATTERN.test(readFileSync(file, 'utf8')))
      .map(file => file.replace(/\\/g, '/'))

    expect(offenders).toEqual(['layers/auth/server/services/session.ts'])
  })
})
