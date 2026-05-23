import type { Runner } from './run'
import { run } from './run'

export async function ghAuthStatus(runner: Runner = run): Promise<{ authed: boolean, detail: string }> {
  const res = await runner('gh', ['auth', 'status'])
  return { authed: res.code === 0, detail: (res.stdout || res.stderr).trim().split('\n')[0] ?? '' }
}

export async function ghRepo(runner: Runner = run): Promise<string | undefined> {
  const res = await runner('gh', ['repo', 'view', '--json', 'nameWithOwner', '-q', '.nameWithOwner'])
  return res.code === 0 ? res.stdout.trim() : undefined
}

export async function setVariable(name: string, value: string, runner: Runner = run): Promise<boolean> {
  const res = await runner('gh', ['variable', 'set', name, '--body', value])
  return res.code === 0
}

export async function setSecret(name: string, value: string, runner: Runner = run): Promise<boolean> {
  const res = await runner('gh', ['secret', 'set', name], { input: value })
  return res.code === 0
}

export async function listConfiguredNames(runner: Runner = run): Promise<{ variables: string[], secrets: string[] }> {
  const vars = await runner('gh', ['variable', 'list', '--json', 'name', '-q', '.[].name'])
  const secrets = await runner('gh', ['secret', 'list', '--json', 'name', '-q', '.[].name'])
  return {
    variables: vars.code === 0 ? vars.stdout.split('\n').map(s => s.trim()).filter(Boolean) : [],
    secrets: secrets.code === 0 ? secrets.stdout.split('\n').map(s => s.trim()).filter(Boolean) : [],
  }
}

export function missingConfig(present: string[], required: readonly string[]): string[] {
  const set = new Set(present)
  return required.filter(r => !set.has(r))
}
