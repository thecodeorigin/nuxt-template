import type { EmailableUser } from '~~/layers/auth/server/services/email'
import type { DispatchFilter } from '#layers/system/shared/schemas/dispatch'
import { db } from '@nuxthub/db'
import {
  organizationMemberRoleTable,
  organizationMemberTable,
  organizationTable,
  roleTable,
  userTable,
} from '@nuxthub/db/schema'
import { kv } from '@nuxthub/kv'
import { asc, eq, inArray } from 'drizzle-orm'
import { isEmailEnabled, sendUserEmail } from '~~/layers/auth/server/services/email'

export interface DispatchOption { id: string, label: string }
export interface DispatchOptions { organizations: DispatchOption[], roles: DispatchOption[] }

/** Options for the recipient pickers: every org, every role (labelled with its org). */
export async function getDispatchOptions(): Promise<DispatchOptions> {
  const orgs = await db
    .select({ id: organizationTable.id, name: organizationTable.name })
    .from(organizationTable)
    .orderBy(asc(organizationTable.name))

  const roles = await db
    .select({ id: roleTable.id, name: roleTable.name, orgName: organizationTable.name })
    .from(roleTable)
    .innerJoin(organizationTable, eq(organizationTable.id, roleTable.organization_id))
    .orderBy(asc(organizationTable.name), asc(roleTable.name))

  return {
    organizations: orgs.map(o => ({ id: o.id, label: o.name })),
    roles: roles.map(r => ({ id: r.id, label: `${r.orgName} · ${r.name}` })),
  }
}

export interface DispatchRecipient {
  id: string
  primary_email: string
  name: string | null
  notification_prefs: { email?: boolean } | null
}
export interface ResolvedRecipients {
  enabled: DispatchRecipient[]
  skippedCount: number
  total: number
}

const RECIPIENT_COLS = {
  id: userTable.id,
  primary_email: userTable.primary_email,
  name: userTable.name,
  notification_prefs: userTable.notification_prefs,
}

/**
 * Union of every selected criterion, deduped by user id. `emails[]` only ever
 * resolves to existing user rows — addresses with no account are dropped (no open
 * relay, no enumeration). Then split into email-enabled vs opted-out.
 */
export async function resolveDispatchRecipients(filter: DispatchFilter): Promise<ResolvedRecipients> {
  const byId = new Map<string, DispatchRecipient>()
  const add = (rows: DispatchRecipient[]) => {
    for (const r of rows) byId.set(r.id, r)
  }

  if (filter.allUsers) {
    add(await db.select(RECIPIENT_COLS).from(userTable))
  }
  else {
    if (filter.organizationIds.length) {
      add(await db.select(RECIPIENT_COLS)
        .from(organizationMemberTable)
        .innerJoin(userTable, eq(userTable.id, organizationMemberTable.user_id))
        .where(inArray(organizationMemberTable.organization_id, filter.organizationIds)))
    }
    if (filter.roleIds.length) {
      add(await db.select(RECIPIENT_COLS)
        .from(organizationMemberRoleTable)
        .innerJoin(organizationMemberTable, eq(organizationMemberTable.id, organizationMemberRoleTable.member_id))
        .innerJoin(userTable, eq(userTable.id, organizationMemberTable.user_id))
        .where(inArray(organizationMemberRoleTable.role_id, filter.roleIds)))
    }
    if (filter.emails.length) {
      add(await db.select(RECIPIENT_COLS)
        .from(userTable)
        .where(inArray(userTable.primary_email, filter.emails)))
    }
  }

  const all = [...byId.values()]
  const enabled = all.filter(r => isEmailEnabled(r.notification_prefs))
  return { enabled, skippedCount: all.length - enabled.length, total: all.length }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Subject is escaped; body is editor-authored HTML embedded into a static shell. */
export function composeEmailHtml(subject: string, bodyHtml: string): string {
  const safeSubject = escapeHtml(subject)
  return `<!doctype html><html><body style="font-family:sans-serif;line-height:1.5;color:#111111">`
    + `<h1 style="font-size:18px;margin:0 0 12px">${safeSubject}</h1>`
    + `<div>${bodyHtml}</div>`
    + `</body></html>`
}

// --- Bulk delivery -----------------------------------------------------------
// A large dispatch (up to MAX_RECIPIENTS) can exceed a Worker's wall-time/CPU
// budget if sent inline. When the Cloudflare Queue binding is present the route
// fans the recipients out as queue messages drained by the consumer plugin
// (layers/system/server/plugins/dispatch-queue.consumer.ts) with retries + DLQ.
// Off-Cloudflare (dev / tests / no binding) it falls back to sendDispatchInline.

/** Producer binding name (env.<binding>) — see cloudflare/README.md + wrangler.jsonc. */
export const DISPATCH_QUEUE_BINDING = 'DISPATCH_QUEUE'
/** Queue name the consumer filters on (a batch can arrive from any bound queue). */
export const DISPATCH_QUEUE_NAME = 'nuxt-template-dispatch'
/** Envelope discriminator for dispatch messages on the queue. */
export const DISPATCH_MESSAGE_TYPE = 'dispatch:email'
/** How long the composed email blob lives in KV while the queue drains. */
export const DISPATCH_JOB_TTL = 60 * 60 // 1 hour

const INLINE_BATCH = 20

/** The composed email, stored once per dispatch so queue messages stay small. */
export interface DispatchJob { subject: string, html: string }
/** One queued unit of work: send `job` to a single recipient. */
export interface DispatchEmailPayload { dispatchId: string, user: EmailableUser }

export function dispatchJobKey(dispatchId: string): string {
  return `dispatch:job:${dispatchId}`
}

export function toDispatchPayloads(dispatchId: string, recipients: EmailableUser[]): DispatchEmailPayload[] {
  return recipients.map(user => ({ dispatchId, user }))
}

/** Synchronous fan-out used off-Cloudflare; bounded by the route's MAX_RECIPIENTS. */
export async function sendDispatchInline(
  recipients: EmailableUser[],
  subject: string,
  html: string,
): Promise<{ sent: number, failed: number }> {
  let sent = 0
  let failed = 0
  for (let i = 0; i < recipients.length; i += INLINE_BATCH) {
    const chunk = recipients.slice(i, i + INLINE_BATCH)
    const results = await Promise.allSettled(chunk.map(u => sendUserEmail(u, { subject, html })))
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value.sent)
        sent++
      else
        failed++
    }
  }
  return { sent, failed }
}

/** Process one queued message: load the shared email blob and send to the recipient. */
export async function sendDispatchMessage(payload: DispatchEmailPayload): Promise<void> {
  const job = await kv.get<DispatchJob>(dispatchJobKey(payload.dispatchId))
  if (!job)
    return // blob expired / already cleaned up — ack without retrying a poison message
  await sendUserEmail(payload.user, { subject: job.subject, html: job.html })
}
