import { supportTicketMessageTable, supportTicketTable } from '@nuxthub/db/schema'
import { DEMO_TICKETS } from '#layers/support/server/constants/defaults'

interface Payload {
  user_id?: string
  organization_id?: string
}

export default defineTask({
  meta: {
    name: 'seed:demo-tickets',
    description: 'Seed the demo Support inbox (3 tickets + initial messages) for a (user_id, organization_id) pair. Idempotent — ids are deterministic on user_id.',
  },
  run: async ({ payload }: { payload?: Payload } = {}) => {
    if (!payload?.user_id || !payload?.organization_id)
      throw new Error('seed:demo-tickets requires payload.user_id and payload.organization_id')

    const user_id = payload.user_id
    const organization_id = payload.organization_id
    const now = Date.now()

    for (const f of DEMO_TICKETS) {
      const id = `demo-ticket-${user_id}-${f.index}`
      const created = new Date(now - (f.index + 1) * 60 * 60 * 1000)
      const agentReplyAt = f.agentReplyAgoMs == null ? null : new Date(now - f.agentReplyAgoMs)

      await db.insert(supportTicketTable).values({
        id,
        user_id,
        organization_id,
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
        author_id: user_id,
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
    return { result: 'ok', user_id, organization_id, total: DEMO_TICKETS.length }
  },
})
