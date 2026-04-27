#!/usr/bin/env node
/**
 * Populate .claude/skill-sources/* by sparse-cloning the upstream repos that back
 * the symlinks under .claude/skills/. Re-run after pulling to update skills.
 */
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCES_DIR = resolve(ROOT, '.claude/skill-sources')

const SKILLS = [
  {
    name: 'nuxt-ui',
    repo: 'https://github.com/nuxt/ui.git',
    branch: 'v4',
    sparsePath: 'skills/nuxt-ui',
  },
]

function run(cmd, cwd) {
  execSync(cmd, { cwd, stdio: 'inherit' })
}

mkdirSync(SOURCES_DIR, { recursive: true })

for (const skill of SKILLS) {
  const dest = resolve(SOURCES_DIR, skill.name)
  if (existsSync(dest)) {
    console.log(`[skills:sync] updating ${skill.name}`)
    run(`git fetch --depth 1 origin ${skill.branch}`, dest)
    run(`git checkout ${skill.branch}`, dest)
    run(`git reset --hard origin/${skill.branch}`, dest)
  }
  else {
    console.log(`[skills:sync] cloning ${skill.name} from ${skill.repo}`)
    run(
      `git clone --depth 1 --branch ${skill.branch} --filter=blob:none --sparse ${skill.repo} ${dest}`,
    )
    run(`git sparse-checkout set ${skill.sparsePath}`, dest)
  }
}

console.log('[skills:sync] done')
