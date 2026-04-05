import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// --- Configuration & Helpers ---
const ENV_FILE = '.env'
const KEYS_TO_UPDATE = [
  'NUXT_AUTH_SECRET',
  'NUXT_TASK_SECRET',
  'NUXT_WEBHOOK_SIGNING_SECRET',
]

// ANSI colors for pure Node.js logging
const cyan = str => `\x1B[36m${str}\x1B[0m`
const green = str => `\x1B[32m${str}\x1B[0m`
const yellow = str => `\x1B[33m${str}\x1B[0m`
const gray = str => `\x1B[90m${str}\x1B[0m`

const generateSecret = () => randomBytes(32).toString('hex')

// --- Main Logic ---
const envPath = join(process.cwd(), ENV_FILE)

if (!existsSync(envPath)) {
  console.log(yellow(`! ${ENV_FILE} not found. Creating a new one...`))
  writeFileSync(envPath, '', 'utf8')
}

try {
  let content = readFileSync(envPath, 'utf8')
  console.log(cyan(`\n🚀 Updating environment variables in ${ENV_FILE}...\n`))

  KEYS_TO_UPDATE.forEach((key) => {
    const newValue = generateSecret()
    const regex = new RegExp(`^${key}=.*`, 'm')
    const newEntry = `${key}="${newValue}"`

    if (regex.test(content)) {
      // Update existing
      content = content.replace(regex, newEntry)
      console.log(`  ${green('✔')} ${key} ${gray('-> [updated]')}`)
    }
    else {
      // Append new
      content += content.endsWith('\n') || content === '' ? `${newEntry}\n` : `\n${newEntry}\n`
      console.log(`  ${green('+')} ${key} ${gray('-> [added]')}`)
    }
  })

  writeFileSync(envPath, content, 'utf8')
  console.log(green(`\n✨ Successfully synced ${KEYS_TO_UPDATE.length} secrets.\n`))
}
catch (err) {
  console.error(`\n❌ ${yellow('Critical Error:')} ${err.message}\n`)
  process.exit(1)
}
