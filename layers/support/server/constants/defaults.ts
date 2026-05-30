/**
 * Support layer defaults — fixtures the demo-login flow seeds so a fresh
 * demo user lands on a non-empty Support inbox.
 */

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

export interface DemoTicketDef {
  index: number
  kind: 'feedback' | 'support'
  category: 'account' | 'billing' | 'technical' | 'other' | null
  subject: string
  status: 'open' | 'active' | 'closed'
  agentReplyAgoMs: number | null
}

export const DEMO_TICKETS: readonly DemoTicketDef[] = [
  { index: 0, kind: 'feedback', category: null, subject: 'Love the new dashboard', status: 'open', agentReplyAgoMs: null },
  { index: 1, kind: 'support', category: 'billing', subject: 'Invoice looks wrong', status: 'active', agentReplyAgoMs: 2 * HOUR_MS },
  { index: 2, kind: 'support', category: 'technical', subject: 'Export keeps failing', status: 'active', agentReplyAgoMs: 2 * DAY_MS },
]
