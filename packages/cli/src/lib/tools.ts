import type { Runner } from './run'
import { run } from './run'

export interface ToolInfo { name: string, present: boolean, version?: string }

async function probe(runner: Runner, cmd: string, args: string[]): Promise<ToolInfo> {
  const res = await runner(cmd, args)
  if (res.code !== 0)
    return { name: cmd, present: false }
  return { name: cmd, present: true, version: res.stdout.trim().split('\n')[0] }
}

export function detectTools(runner: Runner = run) {
  return Promise.all([
    probe(runner, 'node', ['--version']),
    probe(runner, 'pnpm', ['--version']),
    probe(runner, 'gh', ['--version']),
    probe(runner, 'gcloud', ['--version']),
    probe(runner, 'npx', ['--yes', 'wrangler', '--version']),
  ])
}
