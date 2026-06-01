/**
 * Build a self-deployable bundle.json from the Nitro output.
 * Emits: bundle.json { main, compatibilityDate, modules:{name:b64}, migrations:[{name,sql}], version }
 * Also computes a SHA-256 of the bundle bytes and writes it to bundle.sha256
 * so the release workflow can include it in the release body for tamper detection.
 *
 * Run after `pnpm build` with NITRO_PRESET=cloudflare-module.
 * RELEASE_TAG env var is used as the version string.
 */

import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'

const OUTPUT_DIR = '.output/server'
const PUBLIC_DIR = '.output/public'
const MIGRATIONS_DIR = 'server/db/migrations/sqlite'
const TAG = process.env.RELEASE_TAG ?? 'dev'

async function getFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => [])
  const files = []
  for (const e of entries) {
    if (e.isDirectory())
      files.push(...await getFiles(join(dir, e.name)))
    else files.push(join(dir, e.name))
  }
  return files
}

async function main() {
  const allFiles = await getFiles(OUTPUT_DIR)
  const modules = {}
  let main = 'index.mjs'

  for (const f of allFiles) {
    const name = f.replace(`${OUTPUT_DIR}/`, '').replace(`${OUTPUT_DIR}\\`, '')
    if (extname(name) === '.mjs' || extname(name) === '.js') {
      const content = await readFile(f)
      modules[name] = content.toString('base64')
      if (basename(name) === 'index.mjs')
        main = name
    }
  }

  const migFiles = (await readdir(MIGRATIONS_DIR).catch(() => []))
    .filter(f => f.endsWith('.sql') && !f.startsWith('meta'))
    .sort()

  const migrations = []
  for (const f of migFiles) {
    const sql = await readFile(join(MIGRATIONS_DIR, f), 'utf-8')
    migrations.push({ name: f.replace('.sql', ''), sql })
  }

  let compatibilityDate = '2025-01-01'
  const wrangler = await readFile('wrangler.jsonc', 'utf-8').catch(() => '')
  const match = wrangler.match(/"compatibility_date"\s*:\s*"([^"]+)"/)
  if (match)
    compatibilityDate = match[1]

  // Walk .output/public/ for the prebuilt frontend (CSS, JS, fonts, images).
  // The deployed Worker serves these via the Cloudflare Workers Static Assets binding.
  const assets = {}
  const publicFiles = await getFiles(PUBLIC_DIR)
  for (const f of publicFiles) {
    const rel = `/${f.replace(`${PUBLIC_DIR}/`, '').replace(`${PUBLIC_DIR}\\`, '')}`
    const content = await readFile(f)
    assets[rel] = content.toString('base64')
  }

  const bundle = { main, compatibilityDate, modules, assets, migrations, version: TAG }
  const json = JSON.stringify(bundle)
  await writeFile('bundle.json', json)

  const sha256 = createHash('sha256').update(json).digest('hex')
  await writeFile('bundle.sha256', sha256)

  console.log(`bundle.json written: ${Object.keys(modules).length} modules, ${Object.keys(assets).length} assets, ${migrations.length} migrations, version ${TAG}`)
  console.log(`sha256:${sha256}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
