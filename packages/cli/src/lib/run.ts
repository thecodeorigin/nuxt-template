import { spawn } from 'node:child_process'

export interface RunResult { code: number, stdout: string, stderr: string }
export type Runner = (cmd: string, args: string[], opts?: RunOptions) => Promise<RunResult>

export interface RunOptions {
  env?: NodeJS.ProcessEnv
  cwd?: string
  input?: string
}

const isWindows = process.platform === 'win32'

function resolveBin(cmd: string): string {
  if (!isWindows || cmd === 'node')
    return cmd
  return `${cmd}.cmd`
}

export const run: Runner = (cmd, args, opts = {}) => {
  return new Promise((resolve) => {
    const child = spawn(resolveBin(cmd), args, {
      cwd: opts.cwd,
      env: { ...process.env, ...opts.env },
      shell: false,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    child.stdout?.on('data', (d: Buffer) => {
      stdout += d.toString()
    })
    child.stderr?.on('data', (d: Buffer) => {
      stderr += d.toString()
    })
    if (opts.input !== undefined) {
      child.stdin?.write(opts.input)
      child.stdin?.end()
    }
    child.on('close', code => resolve({ code: code ?? 1, stdout, stderr }))
    child.on('error', err => resolve({ code: 1, stdout, stderr: `${stderr}${String(err)}` }))
  })
}

export const wrangler = (args: string[], opts?: RunOptions) => run('npx', ['--yes', 'wrangler', ...args], opts)
export const gh = (args: string[], opts?: RunOptions) => run('gh', args, opts)
export const gcloud = (args: string[], opts?: RunOptions) => run('gcloud', args, opts)
export const nuxt = (args: string[], opts?: RunOptions) => run('npx', ['--yes', 'nuxt', ...args], opts)
