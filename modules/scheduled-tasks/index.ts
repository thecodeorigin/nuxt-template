import type { Nuxt } from '@nuxt/schema'
import { join } from 'node:path'
import { defineNuxtModule, useLogger } from '@nuxt/kit'
import { scanTasksDir } from './scan'

/**
 * Build-time macro for cron. Scans `server/tasks/**` (root + every layer) for
 * `defineScheduledTask('<cron>', ...)` calls and merges the discovered
 * cron -> task-name mapping into `nitro.scheduledTasks`. Nitro then emits the
 * active preset's native cron config at build (Cloudflare wrangler triggers,
 * Vercel cron jobs), so schedules live next to their task and nowhere else.
 */
export default defineNuxtModule({
  meta: { name: 'scheduled-tasks' },
  async setup(_options, nuxt: Nuxt) {
    const logger = useLogger('scheduled-tasks')
    const merged: Record<string, string[]> = {}
    const seen = new Set<string>()

    for (const layer of nuxt.options._layers) {
      const tasksDir = join(layer.cwd, 'server', 'tasks')
      if (seen.has(tasksDir))
        continue
      seen.add(tasksDir)

      const found = await scanTasksDir(tasksDir)
      for (const [cron, names] of Object.entries(found)) {
        merged[cron] ??= []
        merged[cron].push(...names)
      }
    }

    const crons = Object.keys(merged)
    if (crons.length === 0)
      return

    for (const cron of crons)
      merged[cron] = [...new Set(merged[cron])]

    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.experimental ||= {}
      nitroConfig.experimental.tasks = true
      nitroConfig.scheduledTasks ||= {}
      const existing = nitroConfig.scheduledTasks
      for (const [cron, names] of Object.entries(merged)) {
        const cur = existing[cron]
        const curArr = cur == null ? [] : Array.isArray(cur) ? cur : [cur]
        existing[cron] = [...new Set([...curArr, ...names])]
      }
    })

    logger.success(`Registered ${crons.length} cron schedule(s): ${JSON.stringify(merged)}`)
  },
})
