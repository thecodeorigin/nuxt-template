/**
 * Co-locate a cron schedule with a Nitro task. Returns a plain `defineTask`, so
 * it runs exactly like any other task — the only addition is the `cron` literal.
 *
 * At BUILD time, `modules/scheduled-tasks` statically scans `server/tasks/**`
 * (root + every layer) for these calls, reads the `cron` literal, and populates
 * `nitro.scheduledTasks`. Nitro then emits the active preset's native cron
 * config automatically — Cloudflare `wrangler` `triggers.crons`, Vercel
 * `vercel.json` crons — so there is no platform config to maintain by hand.
 * dev / node / bun / deno run it in-process via croner.
 *
 * This is the single scheduling primitive: there is no manually-triggered HTTP
 * cron route. To run a task on demand (manual/test), use Nitro's task runner
 * (`runTask('<name>')` server-side, or the dev `/_nitro/tasks/<name>` endpoint).
 *
 * Constraints:
 * - `cron` MUST be a static string literal (the scan reads source, not runtime).
 * - The task's registered name is derived from its file path under
 *   `server/tasks/` (`server/tasks/support/remindStale.ts` -> `support:remindStale`).
 *   Keep `meta.name` equal to that path-derived name.
 *
 * @example
 * ```ts
 * // layers/support/server/tasks/support/remindStale.ts
 * export default defineScheduledTask('0 * * * *', {
 *   meta: { name: 'support:remindStale', description: 'Nudge stale tickets' },
 *   run: async () => ({ result: await sendTicketReminders() }),
 * })
 * ```
 */
export function defineScheduledTask(_cron: string, definition: Parameters<typeof defineTask>[0]) {
  return defineTask(definition)
}
