import type { ChildProcess } from 'node:child_process'
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

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

const require = createRequire(import.meta.url)

/** Resolve a package's JS bin entry so it can be run with `node` directly. */
function resolvePkgBin(pkg: string): string {
  const pkgJsonPath = require.resolve(`${pkg}/package.json`)
  const { bin } = require(pkgJsonPath) as { bin?: string | Record<string, string> }
  const rel = typeof bin === 'string' ? bin : bin?.[pkg]
  if (!rel)
    throw new Error(`no bin "${pkg}" in ${pkg}/package.json`)
  return join(dirname(pkgJsonPath), rel)
}

/**
 * Spawn a package's bin as a long-lived process via `node`, piping (not
 * buffering) stdout/stderr for live forwarding. Running the resolved JS entry
 * with `node` sidesteps the Windows `.cmd` shim (which `shell: false` cannot
 * spawn). On POSIX the child leads its own process group so {@link killTree}
 * can take the whole tree down.
 */
export function spawnPkg(pkg: string, args: string[], opts: RunOptions = {}): ChildProcess {
  return spawn(process.execPath, [resolvePkgBin(pkg), ...args], {
    cwd: opts.cwd,
    env: { FORCE_COLOR: '1', ...process.env, ...opts.env },
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: !isWindows,
  })
}

/** Kill a child and everything it spawned, cross-platform. */
export function killTree(child: ChildProcess): void {
  if (child.pid == null)
    return
  if (isWindows) {
    spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' })
    return
  }
  try {
    process.kill(-child.pid, 'SIGTERM')
  }
  catch {
    child.kill('SIGTERM')
  }
}

export const wrangler = (args: string[], opts?: RunOptions) => run('npx', ['--yes', 'wrangler', ...args], opts)
export const gh = (args: string[], opts?: RunOptions) => run('gh', args, opts)
export const gcloud = (args: string[], opts?: RunOptions) => run('gcloud', args, opts)
export const nuxt = (args: string[], opts?: RunOptions) => run('npx', ['--yes', 'nuxt', ...args], opts)
