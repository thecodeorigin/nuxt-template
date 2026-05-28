import type { TicketDetail, TicketRequester } from '#layers/support/shared/schemas/ticket'
import { db } from '@nuxthub/db'
import {
  supportTicketMessageTable,
  supportTicketTable,
  userTable,
} from '@nuxthub/db/schema'
import { kv } from '@nuxthub/kv'
import { and, asc, desc, eq, inArray, like, lt, or, sql } from 'drizzle-orm'
import { createError } from 'h3'
import { joinURL, withQuery } from 'ufo'
import { getBaseUrl } from '~~/server/utils/url'
import { sendUserEmail } from '#layers/auth/server/services/user-email'
import { createNotification } from '#layers/notification/server/services/notification'
import { escapeEmailHtml, isTicketStale } from '#layers/support/server/services/ticket-helpers'
import { toTicketMessage, toTicketSummary } from '#layers/support/shared/schemas/ticket'

export { escapeEmailHtml, isTicketStale }

const DAY_MS = 24 * 60 * 60 * 1000
const REMINDER_BATCH = 100
const MSG_RATE_LIMIT = 30
const MSG_RATE_WINDOW = 60 * 60

function reminderEmail(opts: { agentName: string, subject: string, ticketId: string }) {
  const agent = escapeEmailHtml(opts.agentName)
  const subj = escapeEmailHtml(opts.subject)
  const url = withQuery(joinURL(getBaseUrl(), 'support'), { ticket: opts.ticketId })
  return {
    subject: `You have a new message from ${opts.agentName}`,
    html: `<!doctype html><html><body style="font-family:sans-serif;line-height:1.5;color:#111111">`
      + `<p>${agent} replied to your request "<strong>${subj}</strong>".</p>`
      + `<p>Please <a href="${url}">continue the conversation</a> to respond.</p>`
      + `</body></html>`,
    text: `${opts.agentName} replied to your request "${opts.subject}". Continue: ${url}`,
  }
}

async function checkMessageRateLimit(userId: string) {
  const key = `ratelimit:support-msg:${userId}`
  const n = (await kv.get<number>(key)) || 0
  if (n >= MSG_RATE_LIMIT)
    throw createError({ statusCode: 429, statusMessage: 'Too many messages. Try again later.' })
  await kv.set(key, n + 1, { ttl: MSG_RATE_WINDOW })
}

async function loadMessages(ticketId: string) {
  const rows = await db
    .select()
    .from(supportTicketMessageTable)
    .where(eq(supportTicketMessageTable.ticket_id, ticketId))
    .orderBy(asc(supportTicketMessageTable.created_at))
  return rows.map(toTicketMessage)
}

// ---- create ------------------------------------------------------------

export async function createTicket(input: {
  userId: string
  organizationId: string
  kind: 'feedback' | 'support'
  category?: 'account' | 'billing' | 'technical' | 'other'
  subject: string
  body: string
}): Promise<TicketDetail> {
  const ticketId = crypto.randomUUID()
  const now = new Date()
  await db.batch([
    db.insert(supportTicketTable).values({
      id: ticketId,
      user_id: input.userId,
      organization_id: input.organizationId,
      kind: input.kind,
      category: input.category ?? null,
      subject: input.subject,
      status: 'open',
      last_message_at: now,
      last_message_role: 'user',
    }),
    db.insert(supportTicketMessageTable).values({
      ticket_id: ticketId,
      author_id: input.userId,
      author_role: 'user',
      body: input.body,
    }),
  ])
  const [row] = await db.select().from(supportTicketTable).where(eq(supportTicketTable.id, ticketId))
  return { ...toTicketSummary(row!), messages: await loadMessages(ticketId) }
}

// ---- user side (ownership-scoped, NOT org-scoped) ----------------------

export async function listUserTickets(userId: string, offset: number, limit: number) {
  const rows = await db
    .select()
    .from(supportTicketTable)
    .where(eq(supportTicketTable.user_id, userId))
    .orderBy(desc(supportTicketTable.last_message_at))
    .limit(limit + 1)
    .offset(offset)
  return { items: rows.slice(0, limit).map(toTicketSummary), hasMore: rows.length > limit }
}

export async function getUserTicket(userId: string, ticketId: string): Promise<TicketDetail> {
  const [row] = await db
    .select()
    .from(supportTicketTable)
    .where(and(eq(supportTicketTable.id, ticketId), eq(supportTicketTable.user_id, userId)))
  if (!row)
    throw createError({ statusCode: 404, statusMessage: 'Ticket not found' })
  return { ...toTicketSummary(row), messages: await loadMessages(ticketId) }
}

export async function addUserMessage(userId: string, ticketId: string, body: string): Promise<TicketDetail> {
  await checkMessageRateLimit(userId)
  const [row] = await db
    .select()
    .from(supportTicketTable)
    .where(and(eq(supportTicketTable.id, ticketId), eq(supportTicketTable.user_id, userId)))
  if (!row)
    throw createError({ statusCode: 404, statusMessage: 'Ticket not found' })
  if (row.status === 'closed')
    throw createError({ statusCode: 409, statusMessage: 'This request is closed.' })

  const now = new Date()
  await db.insert(supportTicketMessageTable).values({
    ticket_id: ticketId,
    author_id: userId,
    author_role: 'user',
    body,
  })
  await db.update(supportTicketTable)
    .set({ last_message_at: now, last_message_role: 'user' })
    .where(eq(supportTicketTable.id, ticketId))
  return getUserTicket(userId, ticketId)
}

// ---- agent side (gated support:manage upstream; sees all tickets) -------

export async function listAgentTickets(opts: {
  agentId: string
  offset: number
  limit: number
  status?: 'open' | 'active' | 'closed'
  kind?: 'feedback' | 'support'
  mineOnly?: boolean
  search?: string
}) {
  const conds = []
  if (opts.status)
    conds.push(eq(supportTicketTable.status, opts.status))
  if (opts.kind)
    conds.push(eq(supportTicketTable.kind, opts.kind))
  if (opts.mineOnly)
    conds.push(eq(supportTicketTable.assigned_to, opts.agentId))
  if (opts.search)
    conds.push(like(supportTicketTable.subject, `%${opts.search}%`))
  const where = conds.length ? and(...conds) : undefined

  const rows = await db
    .select()
    .from(supportTicketTable)
    .where(where)
    .orderBy(desc(supportTicketTable.last_message_at))
    .limit(opts.limit + 1)
    .offset(opts.offset)
  return { items: rows.slice(0, opts.limit).map(toTicketSummary), hasMore: rows.length > opts.limit }
}

async function loadRequester(userId: string): Promise<TicketRequester | undefined> {
  const [u] = await db
    .select({ id: userTable.id, name: userTable.name, email: userTable.primary_email })
    .from(userTable)
    .where(eq(userTable.id, userId))
  return u ? { id: u.id, name: u.name ?? null, email: u.email } : undefined
}

export async function getAgentTicket(ticketId: string): Promise<TicketDetail> {
  const [row] = await db.select().from(supportTicketTable).where(eq(supportTicketTable.id, ticketId))
  if (!row)
    throw createError({ statusCode: 404, statusMessage: 'Ticket not found' })
  return {
    ...toTicketSummary(row),
    messages: await loadMessages(ticketId),
    requester: await loadRequester(row.user_id),
  }
}

async function agentDisplayName(agentId: string | null): Promise<string | null> {
  if (!agentId)
    return null
  const [u] = await db.select({ name: userTable.name }).from(userTable).where(eq(userTable.id, agentId))
  return u?.name ?? null
}

export async function addAgentMessage(agentId: string, ticketId: string, body: string): Promise<TicketDetail> {
  const [row] = await db.select().from(supportTicketTable).where(eq(supportTicketTable.id, ticketId))
  if (!row)
    throw createError({ statusCode: 404, statusMessage: 'Ticket not found' })

  const now = new Date()
  await db.insert(supportTicketMessageTable).values({
    ticket_id: ticketId,
    author_id: agentId,
    author_role: 'agent',
    body,
  })
  await db.update(supportTicketTable)
    .set({
      last_message_at: now,
      last_message_role: 'agent',
      assigned_to: sql`COALESCE(${supportTicketTable.assigned_to}, ${agentId})`,
      status: sql`CASE WHEN ${supportTicketTable.status} = 'open' THEN 'active' ELSE ${supportTicketTable.status} END`,
    })
    .where(eq(supportTicketTable.id, ticketId))

  const agentName = (await agentDisplayName(agentId)) ?? 'Support team'
  await createNotification({
    userId: row.user_id,
    organizationId: row.organization_id,
    senderName: agentName,
    body: `replied to your request: ${row.subject}`,
    dedupeKey: `support-reply:${ticketId}:${now.getTime()}`,
  })

  return getAgentTicket(ticketId)
}

export async function updateTicket(ticketId: string, patch: { status?: 'open' | 'active' | 'closed', assignedTo?: string | null }): Promise<TicketDetail> {
  const [row] = await db.select().from(supportTicketTable).where(eq(supportTicketTable.id, ticketId))
  if (!row)
    throw createError({ statusCode: 404, statusMessage: 'Ticket not found' })
  const set: Record<string, unknown> = {}
  if (patch.status !== undefined)
    set.status = patch.status
  if (patch.assignedTo !== undefined)
    set.assigned_to = patch.assignedTo
  await db.update(supportTicketTable).set(set).where(eq(supportTicketTable.id, ticketId))
  return getAgentTicket(ticketId)
}

// ---- reminder job (idempotent, race-safe) ------------------------------

export async function sendTicketReminders(now = new Date()): Promise<{ scanned: number, reminded: number, skipped: number }> {
  const cutoff = new Date(now.getTime() - DAY_MS)
  const candidates = await db
    .select()
    .from(supportTicketTable)
    .where(and(
      eq(supportTicketTable.last_message_role, 'agent'),
      inArray(supportTicketTable.status, ['open', 'active']),
      lt(supportTicketTable.last_message_at, cutoff),
      or(
        sql`${supportTicketTable.reminder_sent_at} IS NULL`,
        sql`${supportTicketTable.reminder_sent_at} < ${supportTicketTable.last_message_at}`,
      ),
    ))
    .orderBy(asc(supportTicketTable.last_message_at))
    .limit(REMINDER_BATCH)

  let reminded = 0
  let skipped = 0
  for (const t of candidates) {
    const claimed = await db.update(supportTicketTable)
      .set({ reminder_sent_at: now })
      .where(and(
        eq(supportTicketTable.id, t.id),
        eq(supportTicketTable.last_message_role, 'agent'),
        or(
          sql`${supportTicketTable.reminder_sent_at} IS NULL`,
          sql`${supportTicketTable.reminder_sent_at} < ${supportTicketTable.last_message_at}`,
        ),
      ))
      .returning({ id: supportTicketTable.id })
    if (!claimed.length) {
      skipped++
      continue
    }

    const [requester] = await db
      .select({ id: userTable.id, primary_email: userTable.primary_email, notification_prefs: userTable.notification_prefs })
      .from(userTable)
      .where(eq(userTable.id, t.user_id))
    if (!requester) {
      skipped++
      continue
    }

    const agentName = (await agentDisplayName(t.assigned_to)) ?? 'Support team'
    const mail = reminderEmail({ agentName, subject: t.subject, ticketId: t.id })
    try {
      const res = await sendUserEmail(requester, mail)
      if (res.sent)
        reminded++
      else
        skipped++
    }
    catch { skipped++ }
  }
  return { scanned: candidates.length, reminded, skipped }
}

// ---- demo seed (idempotent; called from demo-login) --------------------

export async function seedDemoTickets(userId: string, organizationId: string) {
  const now = Date.now()
  const fixtures = [
    { i: 0, kind: 'feedback' as const, category: null, subject: 'Love the new dashboard', status: 'open' as const, agentReplyAgoMs: null },
    { i: 1, kind: 'support' as const, category: 'billing' as const, subject: 'Invoice looks wrong', status: 'active' as const, agentReplyAgoMs: 2 * 60 * 60 * 1000 },
    { i: 2, kind: 'support' as const, category: 'technical' as const, subject: 'Export keeps failing', status: 'active' as const, agentReplyAgoMs: 2 * DAY_MS },
  ]
  for (const f of fixtures) {
    const id = `demo-ticket-${userId}-${f.i}`
    const created = new Date(now - (f.i + 1) * 60 * 60 * 1000)
    const agentReplyAt = f.agentReplyAgoMs == null ? null : new Date(now - f.agentReplyAgoMs)
    await db.insert(supportTicketTable).values({
      id,
      user_id: userId,
      organization_id: organizationId,
      kind: f.kind,
      category: f.category,
      subject: f.subject,
      status: f.status,
      last_message_at: agentReplyAt ?? created,
      last_message_role: agentReplyAt ? 'agent' : 'user',
      created_at: created,
    }).onConflictDoNothing()
    await db.insert(supportTicketMessageTable).values({
      id: `${id}-m0`,
      ticket_id: id,
      author_id: userId,
      author_role: 'user',
      body: `(demo) ${f.subject} — details here.`,
      created_at: created,
    }).onConflictDoNothing()
    if (agentReplyAt) {
      await db.insert(supportTicketMessageTable).values({
        id: `${id}-m1`,
        ticket_id: id,
        author_id: null,
        author_role: 'agent',
        body: '(demo) Thanks for reaching out — could you share more detail?',
        created_at: agentReplyAt,
      }).onConflictDoNothing()
    }
  }
}
