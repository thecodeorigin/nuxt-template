import type { Dirent } from 'node:fs'
import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'

const TASK_FILE_RE = /\.(?:ts|js|mjs)$/
// Captures the first string-literal argument of a `defineScheduledTask(...)` call.
const CRON_CALL_RE = /defineScheduledTask\s*\(\s*['"`]([^'"`]+)['"`]/

/** Read the cron literal from a task file's source, or null if it's not a scheduled task. */
export function extractCronLiteral(code: string): string | null {
  return code.match(CRON_CALL_RE)?.[1] ?? null
}

/** Mirror Nitro's path-based task name: `<dir>/<file>` -> `<dir>:<file>` (no extension). */
export function deriveTaskName(absFile: string, tasksDir: string): string {
  return relative(tasksDir, absFile).replace(TASK_FILE_RE, '').split(sep).join(':')
}

/** Map every scheduled task found under `tasksDir` to its cron expression. */
export async function scanTasksDir(tasksDir: string): Promise<Record<string, string[]>> {
  const out: Record<string, string[]> = {}
  if (!existsSync(tasksDir))
    return out

  const entries: Dirent[] = await readdir(tasksDir, { recursive: true, withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isFile() || !TASK_FILE_RE.test(entry.name))
      continue
    const abs = join(entry.parentPath, entry.name)
    const cron = extractCronLiteral(await readFile(abs, 'utf8'))
    if (!cron)
      continue
    const name = deriveTaskName(abs, tasksDir)
    out[cron] ??= []
    out[cron].push(name)
  }
  return out
}
