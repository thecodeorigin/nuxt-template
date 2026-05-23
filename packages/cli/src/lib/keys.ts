import { randomBytes } from 'node:crypto'
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { AUTH_SECRETS, ENV_EXAMPLE_PATH, ENV_PATH } from './env'

export const generateSecret = () => randomBytes(32).toString('hex')

export function ensureEnvFile(): { created: boolean } {
  if (existsSync(ENV_PATH))
    return { created: false }
  if (existsSync(ENV_EXAMPLE_PATH))
    copyFileSync(ENV_EXAMPLE_PATH, ENV_PATH)
  else
    writeFileSync(ENV_PATH, '', 'utf8')
  return { created: true }
}

export function writeEnvKeys(keys: readonly string[] = AUTH_SECRETS): Array<{ key: string, action: 'updated' | 'added' }> {
  let content = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, 'utf8') : ''
  const log: Array<{ key: string, action: 'updated' | 'added' }> = []
  for (const key of keys) {
    const entry = `${key}="${generateSecret()}"`
    const re = new RegExp(`^${key}=.*$`, 'm')
    if (re.test(content)) {
      content = content.replace(re, entry)
      log.push({ key, action: 'updated' })
    }
    else {
      content += content.endsWith('\n') || content === '' ? `${entry}\n` : `\n${entry}\n`
      log.push({ key, action: 'added' })
    }
  }
  writeFileSync(ENV_PATH, content, 'utf8')
  return log
}
